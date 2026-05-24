import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Coffee,
  Dumbbell,
  Flag,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  ListFilter,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  RefreshCcw,
  Scissors,
  Search,
  Sparkles,
  Sun,
  Ticket,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import GymAmbient from '../components/ambient/GymAmbient'
import RestaurantAmbient from '../components/ambient/RestaurantAmbient'
import SalonAmbient from '../components/ambient/SalonAmbient'
import ClinicAmbient from '../components/ambient/ClinicAmbient'
import CoachingAmbient from '../components/ambient/CoachingAmbient'
import TurfAmbient from '../components/ambient/TurfAmbient'
import { API_URL } from '../services/config'
import '../styles/app.css'

type View = 'public' | 'detail' | 'login' | 'dashboard' | 'create' | 'offers' | 'bookings'
type Theme = 'light' | 'dark'
type ToastKind = 'success' | 'error' | 'info'

type SortOption = 'latest' | 'endingSoon' | 'highestDiscount' | 'lowestPrice' | 'highestPrice' | 'mostPopular'

type Business = {
  id: string
  name: string
  businessType: string
  ownerName: string
  phone: string
  email: string
  address: string
  city: string
  logoUrl: string
  openingTime: string
  closingTime: string
}

type Slot = {
  id: string
  offerId: string
  slotDate: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  availableCount: number
  bookingPercentage: number
  status: string
  createdAt: string
}

type Offer = {
  id: string
  businessId: string
  businessName: string
  businessType: string
  city: string
  title: string
  description: string
  category: string
  originalPrice: number
  offerPrice: number
  discountPercentage: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  totalCapacity: number
  maxBookingPerCustomer: number
  termsAndConditions: string
  status: string
  createdAt: string
  updatedAt: string
  slotCount: number
  bookedSeats: number
  availableSlots: number
  thumbnailUrl: string
  slots: Slot[]
}

type Booking = {
  id: string
  bookingReference: string
  offerId: string
  offerName: string
  businessName: string
  slotId: string
  slotDate: string
  startTime: string
  endTime: string
  customerName: string
  customerPhone: string
  customerEmail: string
  peopleCount: number
  specialNote: string
  status: string
  paymentStatus: string
  offerThumbnailUrl: string
  timeline: string
  createdAt: string
}

type Summary = {
  totalOffers: number
  activeOffers: number
  totalBookings: number
  todaysBookings: number
  totalCapacity: number
  bookedSeats: number
  availableSeats: number
  conversionRate: number
  recentBookings: Booking[]
}

type Toast = {
  id: number
  kind: ToastKind
  message: string
}

type AdminSession = {
  name: string
  email: string
  role: 'SuperAdmin' | 'BusinessOwner' | string
  businessId?: string
  businessName?: string
  businessType?: string
}

const emptyBusiness: Omit<Business, 'id'> = {
  name: '',
  businessType: 'Gym',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  logoUrl: '',
  openingTime: '09:00:00',
  closingTime: '21:00:00',
}

const today = new Date().toISOString().slice(0, 10)
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
const categories = ['All', 'Fitness', 'Food', 'Beauty', 'Healthcare', 'Sports', 'Education']
const businessTypes = ['Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other']

const businessTypeOptions = [
  { value: '', label: 'All', icon: <Sparkles size={14} /> },
  { value: 'Restaurant', label: 'Restaurant', icon: <Coffee size={14} /> },
  { value: 'Gym', label: 'Gym', icon: <Dumbbell size={14} /> },
  { value: 'Salon', label: 'Salon', icon: <Scissors size={14} /> },
  { value: 'Clinic', label: 'Clinic', icon: <HeartPulse size={14} /> },
  { value: 'Coaching', label: 'Coaching', icon: <Lightbulb size={14} /> },
  { value: 'Turf', label: 'Turf', icon: <Flag size={14} /> },
  { value: 'Other', label: 'Other', icon: <Sparkles size={14} /> },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest offers' },
  { value: 'endingSoon', label: 'Ending soon' },
  { value: 'highestDiscount', label: 'Highest discount' },
  { value: 'lowestPrice', label: 'Lowest price' },
  { value: 'highestPrice', label: 'Highest price' },
  { value: 'mostPopular', label: 'Most popular' },
]

function loadStoredSession(): AdminSession | null {
  const rawSession = localStorage.getItem('adminSession')
  if (rawSession) {
    try {
      return JSON.parse(rawSession) as AdminSession
    } catch {
      localStorage.removeItem('adminSession')
    }
  }

  const legacyName = localStorage.getItem('adminName')
  return legacyName ? { name: legacyName, email: '', role: 'SuperAdmin' } : null
}

const ambientMap: Record<string, React.ComponentType<{ theme?: Theme; className?: string }>> = {
  Restaurant: RestaurantAmbient,
  Gym: GymAmbient,
  Salon: SalonAmbient,
  Clinic: ClinicAmbient,
  Coaching: CoachingAmbient,
  Turf: TurfAmbient,
  Other: CoachingAmbient,
}

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const listVariants = {
  animate: {
    transition: {
      staggerChildren: 0.055,
    },
  },
}

const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
} | null>(null)

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}

function App() {
  return (
    <ThemeProvider>
      <BookingPlatform />
    </ThemeProvider>
  )
}

function BookingPlatform() {
  const [view, setView] = useState<View>('public')
  const [offers, setOffers] = useState<Offer[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<string>('')
  const [bookingOffer, setBookingOffer] = useState<Offer | null>(null)
  const [confirmation, setConfirmation] = useState<Booking | null>(null)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => loadStoredSession())
  const [filters, setFilters] = useState({ businessType: '', category: '', date: '', minPrice: '', maxPrice: '', status: '', availableOnly: true, search: '' })
  const [searchTerm, setSearchTerm] = useState(filters.search)
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const firstFilterLoad = useRef(true)
  const admin = adminSession?.name ?? ''

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  )

  const filteredOffers = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    let filtered = offers

    if (filters.businessType) {
      filtered = filtered.filter((offer) => offer.businessType === filters.businessType)
    }

    if (filters.category) {
      filtered = filtered.filter((offer) => offer.category === filters.category)
    }

    if (filters.date) {
      filtered = filtered.filter((offer) => offer.startDate <= filters.date && offer.endDate >= filters.date)
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((offer) => offer.offerPrice <= Number(filters.maxPrice))
    }

    if (filters.minPrice) {
      filtered = filtered.filter((offer) => offer.offerPrice >= Number(filters.minPrice))
    }

    if (filters.status) {
      filtered = filtered.filter((offer) => offer.status === filters.status)
    }

    if (filters.availableOnly) {
      filtered = filtered.filter((offer) => offer.availableSlots > 0)
    }

    if (query) {
      filtered = filtered.filter((offer) =>
        [offer.title, offer.businessName, offer.category, offer.businessType, offer.city]
          .join(' ')
          .toLowerCase()
          .includes(query),
      )
    }

    return [...filtered].sort((a, b) => sortOffers(a, b, sortBy))
  }, [filters, offers, sortBy])

  function sortOffers(a: Offer, b: Offer, sortBy: SortOption) {
    switch (sortBy) {
      case 'endingSoon':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      case 'highestDiscount':
        return b.discountPercentage - a.discountPercentage
      case 'lowestPrice':
        return a.offerPrice - b.offerPrice
      case 'highestPrice':
        return b.offerPrice - a.offerPrice
      case 'mostPopular':
        return (b.totalCapacity - b.availableSlots) - (a.totalCapacity - a.availableSlots)
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    }
  }

  function showToast(message: string, kind: ToastKind = 'info') {
    const id = Date.now()
    setToasts((current) => [...current, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3600)
  }

  async function api<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Request failed: ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  async function refreshPublicOffers() {
    const params = new URLSearchParams()
    if (filters.businessType) params.set('businessType', filters.businessType)
    if (filters.category) params.set('category', filters.category)
    if (filters.date) params.set('date', filters.date)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.status) params.set('includeInactive', 'true')
    if (filters.availableOnly) params.set('availableOnly', 'true')
    const data = await api<Offer[]>(`/api/offers?${params.toString()}`)
    setOffers(data)
  }

  function scopeAdminData(session: AdminSession | null, offerData: Offer[], businessData: Business[], bookingData: Booking[]) {
    if (session?.role === 'BusinessOwner' && session.businessId) {
      const scopedOffers = offerData.filter((offer) => offer.businessId === session.businessId)
      const scopedOfferIds = new Set(scopedOffers.map((offer) => offer.id))
      const scopedBookings = bookingData.filter((booking) => scopedOfferIds.has(booking.offerId))
      const scopedBusinesses = businessData.filter((business) => business.id === session.businessId)
      return { scopedOffers, scopedBusinesses, scopedBookings }
    }

    return { scopedOffers: offerData, scopedBusinesses: businessData, scopedBookings: bookingData }
  }

  function buildSummary(offerData: Offer[], bookingData: Booking[]): Summary {
    const totalCapacity = offerData.reduce((sum, offer) => sum + offer.slots.reduce((slotSum, slot) => slotSum + slot.capacity, 0), 0)
    const bookedSeats = offerData.reduce((sum, offer) => sum + offer.slots.reduce((slotSum, slot) => slotSum + slot.bookedCount, 0), 0)
    const todayKey = new Date().toISOString().slice(0, 10)
    return {
      totalOffers: offerData.length,
      activeOffers: offerData.filter((offer) => offer.status === 'Active').length,
      totalBookings: bookingData.length,
      todaysBookings: bookingData.filter((booking) => booking.createdAt.slice(0, 10) === todayKey).length,
      totalCapacity,
      bookedSeats,
      availableSeats: Math.max(0, totalCapacity - bookedSeats),
      conversionRate: totalCapacity ? Number(((bookedSeats / totalCapacity) * 100).toFixed(2)) : 0,
      recentBookings: [...bookingData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    }
  }

  async function refreshAdminData(session = adminSession) {
    const [businessData, offerData, bookingData, summaryData] = await Promise.all([
      api<Business[]>('/api/business'),
      api<Offer[]>('/api/offers?includeInactive=true'),
      api<Booking[]>('/api/bookings'),
      api<Summary>('/api/dashboard/summary'),
    ])
    const { scopedOffers, scopedBusinesses, scopedBookings } = scopeAdminData(session, offerData, businessData, bookingData)
    setBusinesses(scopedBusinesses)
    setOffers(scopedOffers)
    setBookings(scopedBookings)
    setSummary(session?.role === 'BusinessOwner' ? buildSummary(scopedOffers, scopedBookings) : summaryData)
  }

  async function loadPublicData() {
    setIsLoading(true)
    try {
      await refreshPublicOffers()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to load offers.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchTerm }))
    }, 220)

    return () => window.clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (firstFilterLoad.current) {
      firstFilterLoad.current = false
      return
    }

    void loadPublicData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.businessType, filters.category, filters.date, filters.minPrice, filters.maxPrice, filters.status, filters.availableOnly])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPublicData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function navigate(nextView: View) {
    setView(nextView)
    setIsMobileMenuOpen(false)
    if (nextView === 'dashboard' || nextView === 'offers' || nextView === 'bookings' || nextView === 'create') {
      try {
        setIsLoading(true)
        await refreshAdminData()
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Unable to load admin data.', 'error')
      } finally {
        setIsLoading(false)
      }
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setIsActionLoading(true)
    try {
      const user = await api<AdminSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      })
      const session = {
        ...user,
        businessId: user.businessId ?? undefined,
        businessName: user.businessName ?? undefined,
        businessType: user.businessType ?? undefined,
      }
      localStorage.setItem('adminSession', JSON.stringify(session))
      localStorage.removeItem('adminName')
      setAdminSession(session)
      await refreshAdminData(session)
      setView('dashboard')
      showToast(session.role === 'BusinessOwner' ? `Logged in for ${session.businessName}.` : 'Logged in as platform admin.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Login failed.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function registerBusinessOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setIsActionLoading(true)
    try {
      const user = await api<AdminSession>('/api/auth/register-business-owner', {
        method: 'POST',
        body: JSON.stringify({
          businessName: form.get('businessName'),
          businessType: form.get('businessType'),
          ownerName: form.get('ownerName'),
          phone: form.get('phone'),
          businessEmail: form.get('businessEmail'),
          ownerEmail: form.get('ownerEmail'),
          address: form.get('address'),
          city: form.get('city'),
          logoUrl: form.get('logoUrl'),
          openingTime: `${form.get('openingTime')}:00`,
          closingTime: `${form.get('closingTime')}:00`,
          password: form.get('password'),
        }),
      })
      const session = {
        ...user,
        businessId: user.businessId ?? undefined,
        businessName: user.businessName ?? undefined,
        businessType: user.businessType ?? undefined,
      }
      localStorage.setItem('adminSession', JSON.stringify(session))
      localStorage.removeItem('adminName')
      setAdminSession(session)
      await refreshAdminData(session)
      setView('dashboard')
      showToast(`Welcome, ${session.businessName}.`, 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not create business owner account.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function saveBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = {
      name: form.get('name'),
      businessType: form.get('businessType'),
      ownerName: form.get('ownerName'),
      phone: form.get('phone'),
      email: form.get('email'),
      address: form.get('address'),
      city: form.get('city'),
      logoUrl: form.get('logoUrl'),
      openingTime: `${form.get('openingTime')}:00`,
      closingTime: `${form.get('closingTime')}:00`,
    }
    const first = adminSession?.role === 'BusinessOwner' && adminSession.businessId
      ? businesses.find((business) => business.id === adminSession.businessId)
      : businesses[0]
    setIsActionLoading(true)
    try {
      await api<Business>(first ? `/api/business/${first.id}` : '/api/business', {
        method: first ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      await refreshAdminData()
      showToast('Business profile saved.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save business.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function createOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const businessId = adminSession?.role === 'BusinessOwner'
      ? adminSession.businessId
      : String(form.get('businessId') || businesses[0]?.id || '')
    if (!businessId) {
      showToast('A business profile is required before publishing offers.', 'error')
      return
    }

    setIsActionLoading(true)
    try {
      const offer = await api<Offer>('/api/offers', {
        method: 'POST',
        body: JSON.stringify({
          businessId,
          title: form.get('title'),
          description: form.get('description'),
          category: form.get('category'),
          originalPrice: Number(form.get('originalPrice')),
          offerPrice: Number(form.get('offerPrice')),
          startDate: form.get('startDate'),
          endDate: form.get('endDate'),
          startTime: `${form.get('startTime')}:00`,
          endTime: `${form.get('endTime')}:00`,
          totalCapacity: Number(form.get('capacity')),
          maxBookingPerCustomer: Number(form.get('maxBookingPerCustomer')),
          termsAndConditions: form.get('termsAndConditions'),
          status: form.get('status'),
        }),
      })

      await api<Slot>('/api/slots', {
        method: 'POST',
        body: JSON.stringify({
          offerId: offer.id,
          slotDate: form.get('slotDate'),
          startTime: `${form.get('slotStartTime')}:00`,
          endTime: `${form.get('slotEndTime')}:00`,
          capacity: Number(form.get('capacity')),
          status: 'Available',
        }),
      })

      event.currentTarget.reset()
      await refreshAdminData()
      setView('offers')
      showToast('Offer and first slot created.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not create offer.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function bookSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setIsActionLoading(true)
    try {
      const booking = await api<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          slotId: form.get('slotId'),
          customerName: form.get('customerName'),
          customerPhone: form.get('customerPhone'),
          customerEmail: form.get('customerEmail'),
          peopleCount: Number(form.get('peopleCount')),
          specialNote: form.get('specialNote'),
        }),
      })
      setConfirmation(booking)
      setBookingOffer(null)
      await refreshPublicOffers()
      showToast('Booking confirmed.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Booking failed.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function updateBookingStatus(id: string, status: string) {
    setIsActionLoading(true)
    try {
      await api<Booking>(`/api/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
      await refreshAdminData()
      showToast('Booking status updated.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update booking.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  function toOfferPayload(offer: Offer, status = offer.status) {
    return {
      businessId: offer.businessId,
      title: offer.title,
      description: offer.description,
      category: offer.category,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      startDate: offer.startDate,
      endDate: offer.endDate,
      startTime: offer.startTime,
      endTime: offer.endTime,
      totalCapacity: offer.totalCapacity,
      maxBookingPerCustomer: offer.maxBookingPerCustomer,
      termsAndConditions: offer.termsAndConditions,
      status,
    }
  }

  async function saveOffer(offer: Offer, patch: Partial<Offer>) {
    setIsActionLoading(true)
    try {
      await api<Offer>(`/api/offers/${offer.id}`, {
        method: 'PUT',
        body: JSON.stringify(toOfferPayload({ ...offer, ...patch })),
      })
      await refreshAdminData()
      showToast('Offer saved.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save offer.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function duplicateOffer(offer: Offer) {
    setIsActionLoading(true)
    try {
      const clone = await api<Offer>('/api/offers', {
        method: 'POST',
        body: JSON.stringify({
          ...toOfferPayload(offer, 'Draft'),
          title: `${offer.title} Copy`,
        }),
      })

      await Promise.all(offer.slots.map((slot) =>
        api<Slot>('/api/slots', {
          method: 'POST',
          body: JSON.stringify({
            offerId: clone.id,
            slotDate: slot.slotDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity: slot.capacity,
            status: slot.status === 'Full' ? 'Available' : slot.status,
          }),
        }),
      ))
      await refreshAdminData()
      showToast('Offer duplicated as draft.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not duplicate offer.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function deleteOffer(id: string) {
    setIsActionLoading(true)
    try {
      await api<void>(`/api/offers/${id}`, { method: 'DELETE' })
      await refreshAdminData()
      showToast('Offer deleted.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not delete offer.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function saveSlot(slot: Partial<Slot> & { offerId: string }) {
    const body = {
      offerId: slot.offerId,
      slotDate: slot.slotDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: Number(slot.capacity),
      status: slot.status,
    }
    setIsActionLoading(true)
    try {
      await api<Slot>(slot.id ? `/api/slots/${slot.id}` : '/api/slots', {
        method: slot.id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      await refreshAdminData()
      showToast(slot.id ? 'Slot saved.' : 'Slot created.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save slot.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function deleteSlot(id: string) {
    setIsActionLoading(true)
    try {
      await api<void>(`/api/slots/${id}`, { method: 'DELETE' })
      await refreshAdminData()
      showToast('Slot deleted.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not delete slot.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  async function updateOfferStatus(offer: Offer, status: string) {
    setIsActionLoading(true)
    try {
      await api<Offer>(`/api/offers/${offer.id}`, {
        method: 'PUT',
        body: JSON.stringify(toOfferPayload(offer, status)),
      })
      await refreshAdminData()
      showToast('Offer status updated.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update offer.', 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('adminSession')
    localStorage.removeItem('adminName')
    setAdminSession(null)
    setView('public')
    showToast('Logged out.', 'info')
  }

  return (
    <div className="app-shell">
      <Sidebar
        admin={admin}
        currentView={view}
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileMenuOpen}
        onCollapse={() => setIsSidebarCollapsed((current) => !current)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onNavigate={(nextView) => void navigate(nextView)}
        onLogout={logout}
      />

      <div className="app-main">
        <TopBar
          admin={admin}
          view={view}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={(nextView) => void navigate(nextView)}
        />

        <AnimatePresence mode="wait">
          <motion.main
            key={view}
            className="page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {view === 'public' && (
              <PublicMarketplace
                filters={filters}
                searchTerm={searchTerm}
                sortBy={sortBy}
                offers={filteredOffers}
                isLoading={isLoading}
                onSearchTermChange={setSearchTerm}
                onSortChange={setSortBy}
                onFilterChange={setFilters}
                onRefresh={() => void loadPublicData()}
                onSelectOffer={(offer) => {
                  setSelectedOfferId(offer.id)
                  setView('detail')
                }}
                onBook={setBookingOffer}
              />
            )}

            {view === 'detail' && selectedOffer && (
              <OfferDetail
                offer={selectedOffer}
                onBack={() => setView('public')}
                onBook={setBookingOffer}
              />
            )}

            {view === 'login' && (
              <LoginPage
                isLoading={isActionLoading}
                onSubmit={login}
                onRegister={registerBusinessOwner}
              />
            )}

            {view === 'dashboard' && (
              <DashboardPage
                summary={summary}
                offers={offers}
                bookings={bookings}
                businesses={businesses}
                isLoading={isLoading}
                isActionLoading={isActionLoading}
                onSaveBusiness={saveBusiness}
              />
            )}

            {view === 'create' && (
              <CreateOfferPage
                isLoading={isActionLoading}
                businesses={businesses}
                adminSession={adminSession}
                onSubmit={createOffer}
              />
            )}

            {view === 'offers' && (
              <AdminOffers
                offers={offers}
                businesses={businesses}
                isLoading={isLoading}
                isActionLoading={isActionLoading}
                onStatus={updateOfferStatus}
                onSave={saveOffer}
                onDuplicate={duplicateOffer}
                onDelete={deleteOffer}
                onSaveSlot={saveSlot}
                onDeleteSlot={deleteSlot}
              />
            )}

            {view === 'bookings' && (
              <AdminBookings
                bookings={bookings}
                isLoading={isLoading}
                isActionLoading={isActionLoading}
                onStatus={updateBookingStatus}
              />
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {bookingOffer && (
          <BookingModal
            offer={bookingOffer}
            isLoading={isActionLoading}
            onClose={() => setBookingOffer(null)}
            onSubmit={bookSlot}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation && (
          <ConfirmationModal booking={confirmation} onClose={() => setConfirmation(null)} />
        )}
      </AnimatePresence>

      <ToastStack toasts={toasts} />
    </div>
  )
}

function Sidebar({
  admin,
  currentView,
  collapsed,
  mobileOpen,
  onCollapse,
  onCloseMobile,
  onNavigate,
  onLogout,
}: {
  admin: string
  currentView: View
  collapsed: boolean
  mobileOpen: boolean
  onCollapse: () => void
  onCloseMobile: () => void
  onNavigate: (view: View) => void
  onLogout: () => void
}) {
  const links: { label: string; view: View; icon: ReactNode; requiresAdmin?: boolean }[] = [
    { label: 'Marketplace', view: 'public', icon: <Ticket size={18} /> },
    { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard size={18} />, requiresAdmin: true },
    { label: 'Create Offer', view: 'create', icon: <PlusCircle size={18} />, requiresAdmin: true },
    { label: 'Offers', view: 'offers', icon: <BriefcaseBusiness size={18} />, requiresAdmin: true },
    { label: 'Bookings', view: 'bookings', icon: <ClipboardList size={18} />, requiresAdmin: true },
  ]

  const content = (
    <>
      <div className="sidebar-brand">
        <button className="logo-mark" onClick={() => onNavigate('public')}>
          <Sparkles size={20} />
        </button>
        {!collapsed && (
          <div>
            <strong>Willovate</strong>
            <span>Offer OS</span>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        {links
          .filter((link) => !link.requiresAdmin || admin)
          .map((link) => (
            <button
              className={`sidebar-link ${currentView === link.view ? 'active' : ''}`}
              key={link.view}
              onClick={() => onNavigate(link.view)}
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </button>
          ))}
      </div>

      <div className="sidebar-footer">
        {admin ? (
          <>
            <div className="admin-pill">
              <span>{admin.slice(0, 1).toUpperCase()}</span>
              {!collapsed && <p>{admin}</p>}
            </div>
            <button className="sidebar-link" onClick={onLogout} title={collapsed ? 'Logout' : undefined}>
              <LogOut size={18} />
              {!collapsed && <span>Logout</span>}
            </button>
          </>
        ) : (
          <button className="sidebar-link active-soft" onClick={() => onNavigate('login')}>
            <LogIn size={18} />
            {!collapsed && <span>Admin Login</span>}
          </button>
        )}

        <button className="collapse-btn" onClick={onCollapse}>
          <ChevronLeft className={collapsed ? 'rotate-180' : ''} size={17} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      <motion.aside
        className={`sidebar desktop-sidebar ${collapsed ? 'collapsed' : ''}`}
        animate={{ width: collapsed ? 88 : 280 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        {content}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="sidebar mobile-sidebar"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <button className="icon-btn close-mobile" onClick={onCloseMobile}>
                <X size={18} />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function TopBar({
  admin,
  view,
  onOpenMenu,
  onNavigate,
}: {
  admin: string
  view: View
  onOpenMenu: () => void
  onNavigate: (view: View) => void
}) {
  const { theme, toggleTheme } = useTheme()
  const title = {
    public: 'Offer Marketplace',
    detail: 'Offer Details',
    login: 'Admin Access',
    dashboard: 'Dashboard',
    create: 'Create Offer',
    offers: 'Offer Management',
    bookings: 'Booking Desk',
  }[view]

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-menu-btn" onClick={onOpenMenu}>
          <Menu size={19} />
        </button>
        <div>
          <span className="topbar-kicker">Talent Hunt Booking Platform</span>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {admin ? (
          <button className="btn btn-primary" onClick={() => onNavigate('create')}>
            <PlusCircle size={17} />
            <span>New offer</span>
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => onNavigate('login')}>
            <LogIn size={17} />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  )
}

function PublicMarketplace({
  filters,
  searchTerm,
  sortBy,
  offers,
  isLoading,
  onSearchTermChange,
  onSortChange,
  onFilterChange,
  onRefresh,
  onSelectOffer,
  onBook,
}: {
  filters: { businessType: string; category: string; date: string; minPrice: string; maxPrice: string; status: string; availableOnly: boolean; search: string }
  searchTerm: string
  sortBy: SortOption
  offers: Offer[]
  isLoading: boolean
  onSearchTermChange: (value: string) => void
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filters: { businessType: string; category: string; date: string; minPrice: string; maxPrice: string; status: string; availableOnly: boolean; search: string }) => void
  onRefresh: () => void
  onSelectOffer: (offer: Offer) => void
  onBook: (offer: Offer) => void
}) {
  return (
    <div className="marketplace-page">
      <section className="market-hero">
        <motion.div variants={cardVariants}>
          <span className="eyebrow">Premium booking marketplace</span>
          <h2>Limited-time service offers, ready to reserve.</h2>
          <p>
            Discover local deals with live seat availability, countdown urgency, and instant booking confirmation.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onRefresh}>
              <Activity size={17} />
              Refresh offers
            </button>
            <span className="hero-proof">Real-time booking availability</span>
          </div>
        </motion.div>
        <motion.div className="hero-metric-card" variants={cardVariants}>
          <span>Active offers</span>
          <strong>{offers.length}</strong>
          <p>{offers.reduce((sum, offer) => sum + offer.availableSlots, 0)} seats available now</p>
        </motion.div>
      </section>

      <section className="market-actions panel-premium">
        <div className="search-panel">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search offers, categories, cities..."
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
          </div>
          <div className="sort-control">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sortBy} onChange={(event) => onSortChange(event.target.value as SortOption)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-chips">
          {businessTypeOptions.map((option) => (
            <motion.button
              key={option.value || 'all'}
              className={`chip type-chip ${filters.businessType === option.value ? 'active' : ''}`}
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => onFilterChange({ ...filters, businessType: option.value })}
            >
              {option.icon}
              {option.label}
            </motion.button>
          ))}
        </div>

        <div className="market-filters">
          <select value={filters.category} onChange={(event) => onFilterChange({ ...filters, category: event.target.value })}>
            <option value="">Category</option>
            {categories.map((category) => (
              <option key={category} value={category === 'All' ? '' : category}>{category}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(event) => onFilterChange({ ...filters, status: event.target.value })}>
            <option value="">Public status</option>
            {['Active', 'Paused', 'Expired', 'Draft'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="date" value={filters.date} onChange={(event) => onFilterChange({ ...filters, date: event.target.value })} />
          <input type="number" placeholder="Min price" value={filters.minPrice} onChange={(event) => onFilterChange({ ...filters, minPrice: event.target.value })} />
          <input type="number" placeholder="Max price" value={filters.maxPrice} onChange={(event) => onFilterChange({ ...filters, maxPrice: event.target.value })} />
          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(event) => onFilterChange({ ...filters, availableOnly: event.target.checked })}
            />
            Available only
          </label>
          <button className="btn btn-secondary apply-button" onClick={onRefresh}>
            <ListFilter size={17} />
            Apply filters
          </button>
        </div>
      </section>

      {isLoading ? (
        <OfferSkeletonGrid />
      ) : (
        offers.length ? (
          <motion.section className="offer-grid" variants={listVariants} initial="initial" animate="animate">
            {offers.map((offer) => (
              <OfferCard offer={offer} key={offer.id} onSelect={onSelectOffer} onBook={onBook} />
            ))}
          </motion.section>
        ) : <EmptyState title="No offers available" text="Try widening your filters or checking back soon." />
      )}
    </div>
  )
}

function OfferCard({ offer, onSelect, onBook }: { offer: Offer; onSelect: (offer: Offer) => void; onBook: (offer: Offer) => void }) {
  const { theme } = useTheme()
  const Background = ambientMap[offer.businessType] ?? CoachingAmbient
  const percentageBooked = Math.min(100, Math.round(((offer.totalCapacity - offer.availableSlots) / offer.totalCapacity) * 100))

  return (
    <motion.article
      className="offer-card"
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => onSelect(offer)}
      layout
    >
      <Background theme={theme} className="offer-card-ambient" />
      <div className="offer-card-accent" />
      <div className="offer-card-top">
        <div className="business-avatar">{offer.businessName.slice(0, 1)}</div>
        <div>
          <span className="muted-label">{offer.businessType} - {offer.category}</span>
          <h3>{offer.title}</h3>
          <p>{offer.businessName}, {offer.city}</p>
        </div>
        <span className="discount-badge">{offer.discountPercentage}%</span>
      </div>

      <p className="offer-description">{offer.description}</p>

      <div className="offer-pricing">
        <span>Rs. {offer.originalPrice}</span>
        <strong>Rs. {offer.offerPrice}</strong>
      </div>

      <CountdownTimer endDate={offer.endDate} />

      <div className="capacity-block">
        <div>
          <span>{offer.availableSlots} seats left</span>
          <strong>{percentageBooked}% booked</strong>
        </div>
        <div className="progress-track">
          <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${percentageBooked}%` }} />
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-secondary" onClick={(event) => { event.stopPropagation(); onSelect(offer) }}>
          Details
        </button>
        <button className="btn btn-primary" onClick={(event) => { event.stopPropagation(); onBook(offer) }}>
          Book slot
        </button>
      </div>
    </motion.article>
  )
}

function OfferDetail({ offer, onBack, onBook }: { offer: Offer; onBack: () => void; onBook: (offer: Offer) => void }) {
  const { theme } = useTheme()
  const Background = ambientMap[offer.businessType] ?? CoachingAmbient

  return (
    <div className="detail-layout">
      <button className="btn btn-ghost fit" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to marketplace
      </button>

      <section className="detail-hero panel-premium">
        <Background theme={theme} className="detail-hero-ambient" />
        <div>
          <span className="eyebrow">{offer.businessName}</span>
          <h2>{offer.title}</h2>
          <p>{offer.description}</p>
          <div className="detail-meta-grid">
            <InfoTile label="Business" value={`${offer.businessType} in ${offer.city}`} />
            <InfoTile label="Price" value={`Rs. ${offer.offerPrice}`} sub={`was Rs. ${offer.originalPrice}`} />
            <InfoTile label="Discount" value={`${offer.discountPercentage}% off`} />
            <InfoTile label="Booking limit" value={`${offer.maxBookingPerCustomer} per phone`} />
          </div>
        </div>
        <div className="detail-action-card">
          <CountdownTimer endDate={offer.endDate} />
          <strong>{offer.availableSlots} seats available</strong>
          <p>{offer.termsAndConditions}</p>
          <button className="btn btn-primary wide" onClick={() => onBook(offer)}>Book this offer</button>
        </div>
      </section>

      <section className="panel-premium">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Available slots</span>
            <h3>Choose a time that fits</h3>
          </div>
        </div>
        <div className="slot-grid">
          {offer.slots.map((slot) => (
            <div className="slot-card" key={slot.id}>
              <CalendarClock size={18} />
              <div>
                <strong>{slot.slotDate}</strong>
                <span>{slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}</span>
              </div>
              <Badge tone={slot.availableCount > 0 ? 'success' : 'warning'}>{slot.availableCount} left</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function DashboardPage({
  summary,
  offers,
  bookings,
  businesses,
  isLoading,
  isActionLoading,
  onSaveBusiness,
}: {
  summary: Summary | null
  offers: Offer[]
  bookings: Booking[]
  businesses: Business[]
  isLoading: boolean
  isActionLoading: boolean
  onSaveBusiness: (event: FormEvent<HTMLFormElement>) => void
}) {
  const revenue = bookings
    .filter((booking) => booking.status !== 'Cancelled')
    .reduce((sum, booking) => {
      const offer = offers.find((item) => item.id === booking.offerId)
      return sum + (offer ? offer.offerPrice * booking.peopleCount : 0)
    }, 0)
  const expiringOffers = [...offers]
    .filter((offer) => offer.status === 'Active')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 4)
  const topOffers = [...offers]
    .sort((a, b) => (b.bookedSeats ?? 0) - (a.bookedSeats ?? 0))
    .slice(0, 5)
  const categoryData = businessTypes
    .map((type) => ({ name: type, value: offers.filter((offer) => offer.businessType === type).length }))
    .filter((item) => item.value > 0)
  const trendData = bookings.slice(0, 8).reverse().map((booking, index) => ({
    name: `B${index + 1}`,
    bookings: booking.peopleCount,
  }))
  const stats = summary
    ? [
      { label: 'Total offers', value: summary.totalOffers, icon: <Ticket size={19} />, tone: 'primary' },
      { label: 'Active offers', value: summary.activeOffers, icon: <Activity size={19} />, tone: 'success' },
      { label: 'Bookings', value: summary.totalBookings, icon: <Users size={19} />, tone: 'primary' },
      { label: 'Revenue', value: revenue, prefix: 'Rs. ', icon: <BarChart3 size={19} />, tone: 'success' },
      { label: 'Conversion', value: summary.conversionRate, suffix: '%', icon: <BarChart3 size={19} />, tone: 'warning' },
    ]
    : []

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero panel-premium">
        <div>
          <span className="eyebrow">Operator command center</span>
          <h2>Track capacity, bookings, and offer performance.</h2>
          <p>Everything the business owner needs to monitor demand and keep slots moving.</p>
        </div>
        <div className="mini-analytics">
          <span>Available seats</span>
          <strong>{summary ? summary.availableSeats : 0}</strong>
          <p>{summary ? summary.bookedSeats : 0} booked from {summary ? summary.totalCapacity : 0} capacity</p>
        </div>
      </section>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <motion.section className="stats-grid" variants={listVariants} initial="initial" animate="animate">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.section>
      )}

      <section className="analytics-grid">
        <div className="panel-premium chart-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Booking analytics</span>
              <h3>Recent demand</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData.length ? trendData : [{ name: 'Now', bookings: 0 }]}>
              <defs>
                <linearGradient id="bookingGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Area type="monotone" dataKey="bookings" stroke="var(--primary)" fill="url(#bookingGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-premium chart-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Category analytics</span>
              <h3>Business mix</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData.length ? categoryData : [{ name: 'No data', value: 1 }]} dataKey="value" nameKey="name" innerRadius={54} outerRadius={84} paddingAngle={4}>
                {(categoryData.length ? categoryData : [{ name: 'No data', value: 1 }]).map((_, index) => (
                  <Cell key={index} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'][index % 6]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="panel-premium">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Expiring offers</span>
              <h3>Needs attention</h3>
            </div>
          </div>
          <div className="activity-list">
            {expiringOffers.length ? expiringOffers.map((offer) => (
              <div className="activity-item" key={offer.id}>
                <div className="activity-icon"><CalendarClock size={17} /></div>
                <div>
                  <strong>{offer.title}</strong>
                  <span>{offer.businessName} ends {offer.endDate}</span>
                </div>
                <Badge tone="warning">{offer.availableSlots} left</Badge>
              </div>
            )) : <EmptyState title="No active deadlines" text="Expiring active offers will appear here." />}
          </div>
        </div>

        <div className="panel-premium">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Top performers</span>
              <h3>Booked seats</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topOffers.map((offer) => ({ name: offer.title.slice(0, 14), booked: offer.bookedSeats ?? 0 }))}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Bar dataKey="booked" fill="var(--success)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="dashboard-columns">
        <section className="panel-premium">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Business profile</span>
              <h3>Public listing identity</h3>
            </div>
          </div>
          <BusinessForm business={businesses[0]} isLoading={isActionLoading} onSubmit={onSaveBusiness} />
        </section>

        <section className="panel-premium">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Recent activity</span>
              <h3>Latest bookings</h3>
            </div>
          </div>
          <div className="activity-list">
            {summary?.recentBookings.length ? summary.recentBookings.map((booking) => (
              <div className="activity-item" key={booking.id}>
                <div className="activity-icon"><CheckCircle2 size={17} /></div>
                <div>
                  <strong>{booking.customerName}</strong>
                  <span>{booking.offerName} - {booking.peopleCount} people</span>
                </div>
                <Badge tone={booking.status === 'Confirmed' ? 'success' : 'warning'}>{booking.status}</Badge>
              </div>
            )) : <EmptyState title="No bookings yet" text="New reservations will appear here." />}
          </div>
        </section>
      </div>
    </div>
  )
}

function CreateOfferPage({
  isLoading,
  businesses,
  adminSession,
  onSubmit,
}: {
  isLoading: boolean
  businesses: Business[]
  adminSession: AdminSession | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const publishingBusiness = adminSession?.role === 'BusinessOwner'
    ? adminSession.businessName
    : businesses[0]?.name
  return (
    <section className="form-page panel-premium">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Launch inventory</span>
          <h2>Create a limited-time offer</h2>
          <p>{publishingBusiness ? `Publishing as ${publishingBusiness}.` : 'Create or select a business profile before publishing offers.'}</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        {adminSession?.role !== 'BusinessOwner' && (
          <label className="field span-2">
            <span>Publishing business</span>
            <select name="businessId" defaultValue={businesses[0]?.id ?? ''} required>
              <option value="">Select business</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>{business.name} ({business.businessType})</option>
              ))}
            </select>
          </label>
        )}
        <FormField name="title" label="Offer title" placeholder="Lunch Hour Deal" required />
        <FormField name="category" label="Category" defaultValue="Fitness" required />
        <FormField name="originalPrice" label="Original price" type="number" defaultValue="499" required />
        <FormField name="offerPrice" label="Offer price" type="number" defaultValue="99" required />
        <FormField name="startDate" label="Offer start date" type="date" defaultValue={today} required />
        <FormField name="endDate" label="Offer end date" type="date" defaultValue={nextWeek} required />
        <FormField name="startTime" label="Offer start time" type="time" defaultValue="15:00" required />
        <FormField name="endTime" label="Offer end time" type="time" defaultValue="17:00" required />
        <FormField name="capacity" label="Capacity" type="number" defaultValue="20" required />
        <FormField name="maxBookingPerCustomer" label="Max booking per customer" type="number" defaultValue="1" required />
        <FormField name="slotDate" label="First slot date" type="date" defaultValue={today} required />
        <FormField name="slotStartTime" label="Slot start time" type="time" defaultValue="15:00" required />
        <FormField name="slotEndTime" label="Slot end time" type="time" defaultValue="17:00" required />
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue="Active">{['Draft', 'Active', 'Paused', 'Expired', 'Cancelled'].map((status) => <option key={status}>{status}</option>)}</select>
        </label>
        <label className="field span-2">
          <span>Description</span>
          <textarea name="description" placeholder="Describe the customer value clearly." required />
        </label>
        <label className="field span-2">
          <span>Terms and conditions</span>
          <textarea name="termsAndConditions" placeholder="Mention eligibility, cancellation, and arrival rules." />
        </label>
        <button className="btn btn-primary span-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="spin" size={17} /> : <PlusCircle size={17} />}
          Create offer
        </button>
      </form>
    </section>
  )
}

function AdminOffers({
  offers,
  businesses,
  isLoading,
  isActionLoading,
  onStatus,
  onSave,
  onDuplicate,
  onDelete,
  onSaveSlot,
  onDeleteSlot,
}: {
  offers: Offer[]
  businesses: Business[]
  isLoading: boolean
  isActionLoading: boolean
  onStatus: (offer: Offer, status: string) => void
  onSave: (offer: Offer, patch: Partial<Offer>) => void
  onDuplicate: (offer: Offer) => void
  onDelete: (id: string) => void
  onSaveSlot: (slot: Partial<Slot> & { offerId: string }) => void
  onDeleteSlot: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'highestBookings' | 'endingSoon' | 'highestDiscount'>('latest')
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [slotOffer, setSlotOffer] = useState<Offer | null>(null)

  const visibleOffers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return offers
      .filter((offer) => !needle || [offer.title, offer.businessName, offer.category, offer.businessType].join(' ').toLowerCase().includes(needle))
      .filter((offer) => !category || offer.category === category)
      .filter((offer) => !status || offer.status === status)
      .filter((offer) => !businessId || offer.businessId === businessId)
      .filter((offer) => !dateFrom || offer.endDate >= dateFrom)
      .filter((offer) => !dateTo || offer.startDate <= dateTo)
      .sort((a, b) => {
        if (sortBy === 'highestBookings') return (b.bookedSeats ?? 0) - (a.bookedSeats ?? 0)
        if (sortBy === 'endingSoon') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        if (sortBy === 'highestDiscount') return b.discountPercentage - a.discountPercentage
        return new Date(b.createdAt ?? b.startDate).getTime() - new Date(a.createdAt ?? a.startDate).getTime()
      })
  }, [businessId, category, dateFrom, dateTo, offers, query, sortBy, status])

  return (
    <section className="admin-workspace">
      <div className="panel-premium table-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Revenue inventory</span>
            <h2>Manage Offers</h2>
          </div>
        </div>

        <div className="admin-filter-grid">
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search offers or business..." />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {['Draft', 'Active', 'Paused', 'Expired', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={businessId} onChange={(event) => setBusinessId(event.target.value)}>
            <option value="">All businesses</option>
            {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="latest">Latest</option>
            <option value="highestBookings">Highest bookings</option>
            <option value="endingSoon">Ending soon</option>
            <option value="highestDiscount">Highest discount</option>
          </select>
        </div>

        {isLoading ? <TableSkeleton /> : (
          visibleOffers.length ? (
            <div className="responsive-table admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Offer</th><th>Business</th><th>Pricing</th><th>Capacity</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{visibleOffers.map((offer) => {
                  const booked = offer.bookedSeats ?? Math.max(0, offer.totalCapacity - offer.availableSlots)
                  const remaining = offer.availableSlots
                  const occupancy = offer.totalCapacity ? Math.round((booked / offer.totalCapacity) * 100) : 0
                  return (
                    <motion.tr key={offer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <td>
                        <div className="table-offer-cell">
                          <div className={`offer-thumb type-${offer.businessType.toLowerCase()}`}>{offer.businessName.slice(0, 1)}</div>
                          <div>
                            <strong>{offer.title}</strong>
                            <span>{offer.category} · {offer.slotCount ?? offer.slots.length} slots · created {(offer.createdAt ?? '').slice(0, 10)}</span>
                          </div>
                        </div>
                      </td>
                      <td><strong>{offer.businessName}</strong><span>{offer.businessType}</span></td>
                      <td><strong>Rs. {offer.offerPrice}</strong><span>{offer.discountPercentage}% off Rs. {offer.originalPrice}</span></td>
                      <td>
                        <strong>{booked}/{offer.totalCapacity}</strong>
                        <span>{remaining} remaining</span>
                        <div className="mini-progress"><motion.div initial={{ width: 0 }} animate={{ width: `${occupancy}%` }} /></div>
                      </td>
                      <td><strong>{offer.startDate}</strong><span>ends {offer.endDate}</span></td>
                      <td><Badge tone={offer.status === 'Active' ? 'success' : offer.status === 'Paused' ? 'neutral' : 'warning'}>{offer.status}</Badge></td>
                      <td>
                        <div className="action-cluster">
                          <select disabled={isActionLoading} value={offer.status} onChange={(event) => onStatus(offer, event.target.value)}>
                            {['Draft', 'Active', 'Paused', 'Expired', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}
                          </select>
                          <button className="icon-btn" title="Edit offer" onClick={() => setEditingOffer(offer)}><BriefcaseBusiness size={16} /></button>
                          <button className="icon-btn" title="Manage slots" onClick={() => setSlotOffer(offer)}><CalendarClock size={16} /></button>
                          <button className="icon-btn" title="Duplicate offer" onClick={() => onDuplicate(offer)}><RefreshCcw size={16} /></button>
                          <button className="icon-btn danger" title="Delete offer" onClick={() => onDelete(offer.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}</tbody>
              </table>
            </div>
          ) : <EmptyState title="No offers match" text="Adjust filters or create a new offer." />
        )}
      </div>

      <AnimatePresence>
        {editingOffer && (
          <OfferEditorModal
            offer={editingOffer}
            isLoading={isActionLoading}
            onClose={() => setEditingOffer(null)}
            onSubmit={(patch) => {
              onSave(editingOffer, patch)
              setEditingOffer(null)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {slotOffer && (
          <SlotManagerModal
            offer={slotOffer}
            isLoading={isActionLoading}
            onClose={() => setSlotOffer(null)}
            onSaveSlot={onSaveSlot}
            onDeleteSlot={onDeleteSlot}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function AdminBookings({
  bookings,
  isLoading,
  isActionLoading,
  onStatus,
}: {
  bookings: Booking[]
  isLoading: boolean
  isActionLoading: boolean
  onStatus: (id: string, status: string) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const visibleBookings = useMemo(() => bookings
    .filter((booking) => !query || [booking.customerName, booking.customerPhone, booking.customerEmail, booking.bookingReference, booking.offerName].join(' ').toLowerCase().includes(query.toLowerCase()))
    .filter((booking) => !status || booking.status === status)
    .filter((booking) => !date || booking.slotDate === date), [bookings, date, query, status])

  function exportBookings() {
    const header = ['Reference', 'Customer', 'Email', 'Phone', 'Offer', 'Slot', 'People', 'Status', 'Payment']
    const rows = visibleBookings.map((booking) => [
      booking.bookingReference,
      booking.customerName,
      booking.customerEmail,
      booking.customerPhone,
      booking.offerName,
      `${booking.slotDate} ${booking.startTime.slice(0, 5)}`,
      booking.peopleCount,
      booking.status,
      booking.paymentStatus ?? 'Unpaid',
    ])
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bookings-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="panel-premium table-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Customer operations</span>
          <h2>Manage Bookings</h2>
        </div>
        <button className="btn btn-secondary" onClick={exportBookings}><ClipboardList size={17} />Export</button>
      </div>
      <div className="admin-filter-grid booking-filters">
        <div className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, email, reference..." />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No Show'].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>
      {isLoading ? <TableSkeleton /> : (
        visibleBookings.length ? (
          <div className="responsive-table admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Booking</th><th>Customer</th><th>Offer</th><th>Slot</th><th>People</th><th>Status</th><th>Timeline</th><th>Action</th></tr></thead>
              <tbody>{visibleBookings.map((booking) => (
                <motion.tr key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <td><strong>{booking.bookingReference}</strong><span>{new Date(booking.createdAt).toLocaleString()}</span></td>
                  <td><strong>{booking.customerName}</strong><span>{booking.customerEmail || booking.customerPhone}</span></td>
                  <td>
                    <div className="table-offer-cell">
                      <div className="offer-thumb">{booking.businessName.slice(0, 1)}</div>
                      <div><strong>{booking.offerName}</strong><span>{booking.businessName}</span></div>
                    </div>
                  </td>
                  <td><strong>{booking.slotDate}</strong><span>{booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}</span></td>
                  <td>{booking.peopleCount}</td>
                  <td>
                    <Badge tone={booking.status === 'Confirmed' || booking.status === 'Completed' ? 'success' : booking.status === 'Cancelled' ? 'neutral' : 'warning'}>{booking.status}</Badge>
                    <span>{booking.paymentStatus ?? 'Unpaid'}</span>
                  </td>
                  <td><span>{booking.timeline ?? `${booking.status} at booking desk`}</span></td>
                  <td>
                    <select disabled={isActionLoading} value={booking.status} onChange={(event) => onStatus(booking.id, event.target.value)}>
                      {['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No Show'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState title="No bookings found" text="Try a different status, date, or customer search." />
      )}
    </section>
  )
}

function OfferEditorModal({
  offer,
  isLoading,
  onClose,
  onSubmit,
}: {
  offer: Offer
  isLoading: boolean
  onClose: () => void
  onSubmit: (patch: Partial<Offer>) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({
      title: String(form.get('title')),
      description: String(form.get('description')),
      category: String(form.get('category')),
      originalPrice: Number(form.get('originalPrice')),
      offerPrice: Number(form.get('offerPrice')),
      startDate: String(form.get('startDate')),
      endDate: String(form.get('endDate')),
      startTime: `${form.get('startTime')}:00`,
      endTime: `${form.get('endTime')}:00`,
      totalCapacity: Number(form.get('totalCapacity')),
      maxBookingPerCustomer: Number(form.get('maxBookingPerCustomer')),
      termsAndConditions: String(form.get('termsAndConditions')),
      status: String(form.get('status')),
    })
  }

  return (
    <ModalFrame onClose={onClose}>
      <form className="booking-modal form-grid" onSubmit={submit}>
        <button className="icon-btn modal-close" type="button" onClick={onClose}><X size={18} /></button>
        <div className="span-2">
          <span className="eyebrow">Offer editor</span>
          <h2>{offer.title}</h2>
        </div>
        <FormField name="title" label="Title" defaultValue={offer.title} required />
        <FormField name="category" label="Category" defaultValue={offer.category} required />
        <FormField name="originalPrice" label="Original price" type="number" defaultValue={String(offer.originalPrice)} required />
        <FormField name="offerPrice" label="Offer price" type="number" defaultValue={String(offer.offerPrice)} required />
        <FormField name="startDate" label="Start date" type="date" defaultValue={offer.startDate} required />
        <FormField name="endDate" label="End date" type="date" defaultValue={offer.endDate} required />
        <FormField name="startTime" label="Start time" type="time" defaultValue={offer.startTime.slice(0, 5)} required />
        <FormField name="endTime" label="End time" type="time" defaultValue={offer.endTime.slice(0, 5)} required />
        <FormField name="totalCapacity" label="Total capacity" type="number" defaultValue={String(offer.totalCapacity)} required />
        <FormField name="maxBookingPerCustomer" label="Max per customer" type="number" defaultValue={String(offer.maxBookingPerCustomer)} required />
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={offer.status}>{['Draft', 'Active', 'Paused', 'Expired', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="field span-2">
          <span>Description</span>
          <textarea name="description" defaultValue={offer.description} required />
        </label>
        <label className="field span-2">
          <span>Terms and conditions</span>
          <textarea name="termsAndConditions" defaultValue={offer.termsAndConditions} />
        </label>
        <button className="btn btn-primary span-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="spin" size={17} /> : <CheckCircle2 size={17} />}
          Save offer
        </button>
      </form>
    </ModalFrame>
  )
}

function SlotManagerModal({
  offer,
  isLoading,
  onClose,
  onSaveSlot,
  onDeleteSlot,
}: {
  offer: Offer
  isLoading: boolean
  onClose: () => void
  onSaveSlot: (slot: Partial<Slot> & { offerId: string }) => void
  onDeleteSlot: (id: string) => void
}) {
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSaveSlot({
      id: editingSlot?.id,
      offerId: offer.id,
      slotDate: String(form.get('slotDate')),
      startTime: `${form.get('startTime')}:00`,
      endTime: `${form.get('endTime')}:00`,
      capacity: Number(form.get('capacity')),
      status: String(form.get('status')),
    })
    setEditingSlot(null)
    event.currentTarget.reset()
  }

  return (
    <ModalFrame onClose={onClose}>
      <div className="booking-modal slot-manager">
        <button className="icon-btn modal-close" type="button" onClick={onClose}><X size={18} /></button>
        <span className="eyebrow">Slot management</span>
        <h2>{offer.title}</h2>
        <div className="slot-admin-list">
          {offer.slots.length ? offer.slots.map((slot) => {
            const percent = slot.bookingPercentage ?? (slot.capacity ? Math.round((slot.bookedCount / slot.capacity) * 100) : 0)
            return (
              <div className="slot-admin-item" key={slot.id}>
                <div>
                  <strong>{slot.slotDate}</strong>
                  <span>{slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)} · {slot.bookedCount}/{slot.capacity} booked</span>
                  <div className="mini-progress"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} /></div>
                </div>
                <Badge tone={slot.status === 'Available' ? 'success' : slot.status === 'Full' ? 'warning' : 'neutral'}>{slot.status}</Badge>
                <div className="action-cluster">
                  <button className="icon-btn" onClick={() => setEditingSlot(slot)}><CalendarClock size={16} /></button>
                  <button className="icon-btn" onClick={() => onSaveSlot({ ...slot, status: slot.status === 'Closed' ? 'Available' : 'Closed' })}>
                    {slot.status === 'Closed' ? <RefreshCcw size={16} /> : <X size={16} />}
                  </button>
                  <button className="icon-btn danger" onClick={() => onDeleteSlot(slot.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            )
          }) : <EmptyState title="No slots yet" text="Create the first reservable time below." />}
        </div>

        <form className="form-grid" onSubmit={submit}>
          <FormField name="slotDate" label="Slot date" type="date" defaultValue={editingSlot?.slotDate ?? today} required />
          <FormField name="startTime" label="Start time" type="time" defaultValue={editingSlot?.startTime.slice(0, 5) ?? offer.startTime.slice(0, 5)} required />
          <FormField name="endTime" label="End time" type="time" defaultValue={editingSlot?.endTime.slice(0, 5) ?? offer.endTime.slice(0, 5)} required />
          <FormField name="capacity" label="Capacity" type="number" defaultValue={String(editingSlot?.capacity ?? 10)} required />
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={editingSlot?.status ?? 'Available'}>{['Available', 'Closed', 'Full'].map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <button className="btn btn-primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="spin" size={17} /> : <PlusCircle size={17} />}
            {editingSlot ? 'Save slot' : 'Create slot'}
          </button>
        </form>
      </div>
    </ModalFrame>
  )
}

function LoginPage({
  isLoading,
  onSubmit,
  onRegister,
}: {
  isLoading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onRegister: (event: FormEvent<HTMLFormElement>) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card panel-premium"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="auth-icon"><LogIn size={24} /></div>
        <span className="eyebrow">Secure operator access</span>
        <h2>{mode === 'login' ? 'Admin Login' : 'Business Owner Onboarding'}</h2>
        <p>{mode === 'login'
          ? 'Use platform admin for all businesses, or a business owner account to manage only that business.'
          : 'Create your business profile and owner login, then publish offers from your dashboard.'}</p>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>Register business</button>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={onSubmit}>
            <FormField name="email" label="Email" type="email" defaultValue="admin@willovate.demo" required />
            <FormField name="password" label="Password" type="password" defaultValue="Admin@123" required />
            <div className="demo-credentials">
              <strong>Business owner demos</strong>
              <span>gym@willovate.demo / Owner@123</span>
              <span>restaurant@willovate.demo / Owner@123</span>
              <span>salon@willovate.demo / Owner@123</span>
              <span>clinic@willovate.demo / Owner@123</span>
              <span>turf@willovate.demo / Owner@123</span>
              <span>coaching@willovate.demo / Owner@123</span>
            </div>
            <button className="btn btn-primary wide" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={17} /> : <LogIn size={17} />}
              Login
            </button>
          </form>
        ) : (
          <form className="auth-form onboarding-form" onSubmit={onRegister}>
            <FormField name="businessName" label="Business name" placeholder="Peak Hour Fitness" required />
            <label className="field">
              <span>Business type</span>
              <select name="businessType" defaultValue="Gym">{businessTypes.map((type) => <option key={type}>{type}</option>)}</select>
            </label>
            <FormField name="ownerName" label="Owner name" placeholder="Aarav Mehta" required />
            <FormField name="phone" label="Phone number" placeholder="9876543210" required />
            <FormField name="businessEmail" label="Business email" type="email" placeholder="hello@business.com" required />
            <FormField name="ownerEmail" label="Login email" type="email" placeholder="owner@business.com" required />
            <FormField name="city" label="City" placeholder="Mumbai" required />
            <FormField name="address" label="Address" placeholder="Street, area, landmark" />
            <FormField name="logoUrl" label="Logo URL optional" />
            <FormField name="openingTime" label="Opening time" type="time" defaultValue="09:00" required />
            <FormField name="closingTime" label="Closing time" type="time" defaultValue="21:00" required />
            <FormField name="password" label="Password" type="password" placeholder="Minimum 8 characters" required />
            <button className="btn btn-primary wide span-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={17} /> : <PlusCircle size={17} />}
              Create owner account
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

function BookingModal({
  offer,
  isLoading,
  onClose,
  onSubmit,
}: {
  offer: Offer
  isLoading: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const availableSlots = offer.slots.filter((slot) => slot.availableCount > 0 && slot.status === 'Available')

  return (
    <ModalFrame onClose={onClose}>
      <form className="booking-modal" onSubmit={onSubmit}>
        <button className="icon-btn modal-close" type="button" onClick={onClose}><X size={18} /></button>
        <span className="eyebrow">{offer.businessName}</span>
        <h2>Reserve {offer.title}</h2>
        <p>Choose a live slot and confirm customer details. Your reference is generated instantly.</p>
        <label className="field">
          <span>Selected slot</span>
          <select name="slotId" required>
            <option value="">Select slot</option>
            {availableSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.slotDate} {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)} - {slot.availableCount} left</option>
            ))}
          </select>
        </label>
        <FormField name="customerName" label="Customer name" required />
        <FormField name="customerPhone" label="Phone number" required />
        <FormField name="customerEmail" label="Email optional" type="email" />
        <FormField name="peopleCount" label="Number of people" type="number" min="1" defaultValue="1" required />
        <label className="field">
          <span>Special note</span>
          <textarea name="specialNote" placeholder="Optional preference or request" />
        </label>
        <button className="btn btn-primary wide" disabled={isLoading || availableSlots.length === 0}>
          {isLoading ? <Loader2 className="spin" size={17} /> : <CheckCircle2 size={17} />}
          Confirm booking
        </button>
      </form>
    </ModalFrame>
  )
}

function ConfirmationModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <ModalFrame onClose={onClose}>
      <div className="confirmation-card">
        <button className="icon-btn modal-close" type="button" onClick={onClose}><X size={18} /></button>
        <div className="success-orb"><CheckCircle2 size={32} /></div>
        <span className="eyebrow">Booking confirmed</span>
        <h2>{booking.bookingReference}</h2>
        <div className="confirmation-grid">
          <InfoTile label="Offer" value={booking.offerName} />
          <InfoTile label="Business" value={booking.businessName} />
          <InfoTile label="Slot" value={`${booking.slotDate} ${booking.startTime.slice(0, 5)}-${booking.endTime.slice(0, 5)}`} />
          <InfoTile label="Customer" value={booking.customerName} />
          <InfoTile label="Status" value={booking.status} />
        </div>
        <button className="btn btn-primary wide" onClick={onClose}>Done</button>
      </div>
    </ModalFrame>
  )
}

function ModalFrame({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button className="modal-click-catcher" onClick={onClose} aria-label="Close modal" />
      <motion.div
        className="modal-panel"
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function BusinessForm({
  business,
  isLoading,
  onSubmit,
}: {
  business?: Business
  isLoading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const value = business ?? ({ ...emptyBusiness, id: '' } as Business)
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <FormField name="name" label="Business name" defaultValue={value.name} required />
      <label className="field">
        <span>Business type</span>
        <select name="businessType" defaultValue={value.businessType}>{businessTypes.map((type) => <option key={type}>{type}</option>)}</select>
      </label>
      <FormField name="ownerName" label="Owner name" defaultValue={value.ownerName} required />
      <FormField name="phone" label="Phone" defaultValue={value.phone} required />
      <FormField name="email" label="Email" type="email" defaultValue={value.email} required />
      <FormField name="city" label="City" defaultValue={value.city} required />
      <FormField name="address" label="Address" defaultValue={value.address} />
      <FormField name="logoUrl" label="Logo URL" defaultValue={value.logoUrl} />
      <FormField name="openingTime" label="Opening time" type="time" defaultValue={value.openingTime.slice(0, 5)} required />
      <FormField name="closingTime" label="Closing time" type="time" defaultValue={value.closingTime.slice(0, 5)} required />
      <button className="btn btn-primary span-2" disabled={isLoading}>
        {isLoading ? <Loader2 className="spin" size={17} /> : <CheckCircle2 size={17} />}
        Save profile
      </button>
    </form>
  )
}

function FormField({
  label,
  ...props
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  min?: string
  required?: boolean
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  )
}

function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  icon,
  tone,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: ReactNode
  tone: string
}) {
  return (
    <motion.div className={`stat-card tone-${tone}`} variants={cardVariants} whileHover={{ y: -4 }}>
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{prefix}<CountUp value={value} suffix={suffix} /></strong>
    </motion.div>
  )
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 90, damping: 18 })
  const display = useTransform(spring, (latest) => `${Number(latest.toFixed(value % 1 === 0 ? 0 : 2))}${suffix}`)

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  return <motion.span>{display}</motion.span>
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [remaining, setRemaining] = useState(() => getRemainingTime(endDate))

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemainingTime(endDate)), 60000)
    return () => window.clearInterval(timer)
  }, [endDate])

  const urgent = remaining.days <= 2
  return (
    <div className={`countdown ${urgent ? 'urgent' : ''}`}>
      <CalendarClock size={16} />
      <span>{remaining.days}d {remaining.hours}h left</span>
    </div>
  )
}

function getRemainingTime(endDate: string) {
  const end = new Date(`${endDate}T23:59:59`).getTime()
  const diff = Math.max(0, end - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
  }
}

function InfoTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="info-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <p>{sub}</p>}
    </div>
  )
}

function Badge({ children, tone }: { children: ReactNode; tone: 'success' | 'warning' | 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            className={`toast toast-${toast.kind}`}
            key={toast.id}
            initial={{ opacity: 0, x: 32, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 32, scale: 0.98 }}
          >
            {toast.kind === 'success' ? <CheckCircle2 size={18} /> : <Activity size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function OfferSkeletonGrid() {
  return (
    <div className="offer-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-line short" />
          <div className="skeleton-line tall" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-row"><div /><div /></div>
        </div>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, index) => <div className="skeleton-stat" key={index} />)}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="table-skeleton">
      {Array.from({ length: 7 }).map((_, index) => <div className="skeleton-line" key={index} />)}
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Sparkles size={22} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export default App
