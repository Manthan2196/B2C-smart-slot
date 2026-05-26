using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Extensions;
using Backend.Helpers;
using Backend.Seed;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        // Allow optional configured origin(s), e.g. Frontend:AllowedOrigins as a semicolon-separated list.
        var configured = builder.Configuration["Frontend:AllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            var origins = configured.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (origins.Length > 0)
            {
                policy.WithOrigins(origins);
            }
        }

        // Always allow localhost and 127.0.0.1 with any port in development/local setups
        policy.SetIsOriginAllowed(origin =>
        {
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
            var host = uri.Host;
            return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(host, "127.0.0.1", StringComparison.OrdinalIgnoreCase);
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var connectionString = NormalizePostgresConnectionString(
    builder.Configuration.GetConnectionString("DefaultConnection"));

builder.Services.AddDbContext<BookingPlatformDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<BookingPlatformDbContext>();
        await db.Database.MigrateAsync();
        await SchemaBootstrapper.EnsureOwnershipSchemaAsync(db);
        await DemoDataSeeder.SeedAsync(db);
    }
    catch (Exception ex) when (app.Environment.IsDevelopment())
    {
        app.Logger.LogWarning("Database setup was skipped: {Message}", ex.Message);
    }
}

app.MapPlatformEndpoints();
app.Run();

static string NormalizePostgresConnectionString(string? connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return string.Empty;
    }

    if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return connectionString;
    }

    var withoutScheme = connectionString[(connectionString.IndexOf("://", StringComparison.Ordinal) + 3)..];
    var credentialsEnd = withoutScheme.LastIndexOf('@');
    if (credentialsEnd < 0)
    {
        return connectionString;
    }

    var credentials = withoutScheme[..credentialsEnd];
    var hostAndDatabase = withoutScheme[(credentialsEnd + 1)..];
    var passwordStart = credentials.IndexOf(':');
    if (passwordStart < 0)
    {
        return connectionString;
    }

    var username = Uri.UnescapeDataString(credentials[..passwordStart]);
    var password = Uri.UnescapeDataString(credentials[(passwordStart + 1)..]);
    var databaseStart = hostAndDatabase.IndexOf('/');
    var hostAndPort = databaseStart >= 0 ? hostAndDatabase[..databaseStart] : hostAndDatabase;
    var database = databaseStart >= 0 ? hostAndDatabase[(databaseStart + 1)..] : "postgres";
    var queryStart = database.IndexOf('?');
    if (queryStart >= 0)
    {
        database = database[..queryStart];
    }

    var portStart = hostAndPort.LastIndexOf(':');
    var host = portStart >= 0 ? hostAndPort[..portStart] : hostAndPort;
    var port = portStart >= 0 ? hostAndPort[(portStart + 1)..] : "5432";

    return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Allow;Trust Server Certificate=true;Check Certificate Revocation=false;Channel Binding=Disable";
}
