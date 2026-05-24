using System.Security.Cryptography;
using System.Text;

namespace Backend.Helpers;

public static class PasswordHelper
{
    public static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}
