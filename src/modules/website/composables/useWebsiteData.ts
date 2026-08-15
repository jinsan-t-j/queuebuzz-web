import {
  BarChart3,
  Beer,
  Car,
  Coffee,
  Flame,
  Flower2,
  Gift,
  Globe,
  Heart,
  Landmark as LandmarkIcon,
  Layers,
  Layout,
  Map,
  Moon,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Ticket,
  Users,
  Utensils,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

export function useWebsiteData() {
  const isLoading = ref(false)
  const error = ref(null)
  const visibleIds = ref(new Set<string>())
  const observer = ref<IntersectionObserver | null>(null)

  // --- CONSTANTS ---
  const HERO_DATA = {
    title_line_1: 'ZERO LINES.',
    title_line_2: 'BETTER BUSINESS.',
    subtext:
      'Stop managing crowds and start managing your business. Ditch the physical line and let your customers wait on their own terms while you orchestrate the flow with absolute precision. The Smartest Way to Manage Crowds.',
    categories: ['HEALTHCARE', 'RETAIL', 'HOSPITALITY', 'BANKING', 'EVENTS', 'GOVERNMENT'],
  }

  const FEATURE_TABS = [
    {
      id: 'real-time',
      label: 'Real-time Sync',
      heading: 'In the blink of an eye',
      text: 'Our sync engine works like clockwork. Customers see their status update instantly, keeping them in the loop without lifting a finger.',
      icon: Zap,
    },
    {
      id: 'branding',
      label: 'Custom Branding',
      heading: 'The icing on the cake',
      text: 'Put your best foot forward. Personalize the join experience with your logo and colors so it fits your business like a glove.',
      icon: Layout,
    },
    {
      id: 'analytics',
      label: 'Smart Reports',
      heading: 'See the big picture',
      text: "Don't miss a beat. Track peak hours and service times to keep your finger on the pulse of your business performance.",
      icon: BarChart3,
    },
  ]

  const USE_CASES = [
    {
      title: 'Modern Clinics',
      description:
        'Manage patient flow without crowded waiting rooms, reducing health risks and improving patient satisfaction.',
      icon: ShieldCheck,
    },
    {
      title: 'High-Traffic Retail',
      description:
        'Let customers shop freely while they wait for their turn at the fitting room or checkout counter.',
      icon: Smartphone,
    },
    {
      title: 'Smart Hospitality',
      description:
        'Coordinate walk-ins and reservations seamlessly, allowing guests to enjoy the local area instead of a sidewalk.',
      icon: Globe,
    },
    {
      title: 'Service Centers',
      description:
        'Automotive and electronic repair centers managing drop-offs and pick-ups with clear time expectations.',
      icon: Layers,
    },
    {
      title: 'Public Events',
      description:
        'Manage ticket collections, entry lines, and food stall crowds at festivals and conferences.',
      icon: Users,
    },
    {
      title: 'Corporate Hubs',
      description:
        'Visitor management and front-desk coordination for modern office buildings and co-working spaces.',
      icon: Layout,
    },
  ]

  const FAQ_LIST = [
    {
      question: 'How do customers join without an app?',
      answer:
        'Customers simply scan a QR code at your entrance or visit a short URL. Their browser acts as their ticket, keeping them updated in real-time without any installation.',
    },
    {
      question: 'Is it truly global? Does it support my language?',
      answer:
        'Yes. QueueBuzz is built on international standards. While the dashboard is currently in English, the customer-facing interface is designed to be intuitive and accessible to everyone, everywhere.',
    },
    {
      question: 'Can I handle multiple service categories?',
      answer:
        'Absolutely. You can set up different "Services" within a single queue (e.g., General Inquiries vs. Technical Support). This allows you to prioritize and route customers to the right staff members.',
    },
    {
      question: 'How secure is customer data?',
      answer:
        "Privacy is our core principle. We don't track customer identities or require phone numbers unless you explicitly enable SMS alerts. All queue sessions are ephemeral and secure.",
    },
    {
      question: 'What hardware do I need?',
      answer:
        'None. QueueBuzz runs on any device with a browser—laptops, tablets, or even your smartphone. There is no need for expensive ticket printers or specialized monitors.',
    },
    {
      question: 'How do I export my data?',
      answer:
        'Every served and skipped customer is logged in your History. You can filter these records by date and export them as a standardized CSV file for your own analytics or CRM.',
    },
  ]

  const INDUSTRY_CATEGORIES = [
    [
      { name: 'HEALTHCARE', icon: ShieldCheck },
      { name: 'RETAIL', icon: ShoppingBag },
      { name: 'HOSPITALITY', icon: Globe },
      { name: 'BANKING', icon: LandmarkIcon },
      { name: 'EVENTS', icon: Users },
      { name: 'FOOD TRUCKS', icon: Utensils },
      { name: 'AUTO REPAIR', icon: Wrench },
      { name: 'CONFERENCES', icon: Users },
      { name: 'DRIVE-THRUS', icon: Car },
      { name: 'STREET FOOD', icon: Utensils },
      { name: 'TICKET COUNTERS', icon: Ticket },
      { name: 'SOUQS', icon: ShoppingBag },
      { name: 'SHISHA LOUNGES', icon: Flame },
      { name: 'NIGHT MARKETS', icon: Moon },
      { name: 'BODEGAS', icon: Store },
      { name: 'SPAZA SHOPS', icon: Store },
      { name: 'TIANGUIS', icon: ShoppingBag },
      { name: 'TRATTORIAS', icon: Utensils },
    ],
    [
      { name: 'GOVERNMENT', icon: LandmarkIcon },
      { name: 'SALONS', icon: Scissors },
      { name: 'CLINICS', icon: ShieldCheck },
      { name: 'EDUCATION', icon: Globe },
      { name: 'LOGISTICS', icon: Layers },
      { name: 'FITTING ROOMS', icon: Smartphone },
      { name: 'MUSEUMS', icon: LandmarkIcon },
      { name: 'PHARMACIES', icon: ShieldCheck },
      { name: 'THEME PARKS', icon: Map },
      { name: 'KIRANA STORES', icon: Store },
      { name: 'DISPENSARIES', icon: Heart },
      { name: 'DMVs', icon: LandmarkIcon },
      { name: 'BOUTIQUES', icon: ShoppingBag },
      { name: 'AYURVEDA', icon: Flower2 },
      { name: 'MEGA MALLS', icon: Store },
      { name: 'PERFUMERIES', icon: Sparkles },
      { name: 'EMBASSIES', icon: LandmarkIcon },
      { name: 'KOPITIAMS', icon: Coffee },
      { name: 'FERIAS', icon: Store },
      { name: 'CHRISTMAS MARKETS', icon: Gift },
      { name: 'BIERGARTENS', icon: Beer },
      { name: 'PULPERÍAS', icon: Store },
    ],
  ]

  const UPGRADE_DATA = [
    { chaos: 'Manual Shouting', calm: 'Mobile Pings', icon: Zap, delay: '0ms' },
    { chaos: 'Paper Waste', calm: 'Digital Passes', icon: Smartphone, delay: '100ms' },
    { chaos: 'Cramped Lobby', calm: 'Total Freedom', icon: Globe, delay: '200ms' },
    { chaos: 'Blind Waiting', calm: 'Live Tracking', icon: BarChart3, delay: '300ms' },
  ]

  const mutationObserver = ref<MutationObserver | null>(null)

  // --- STATE ---
  const testimonials = ref([])
  const isPwa = ref(false)
  const activeTab = ref('real-time')
  const openFaqIdx = ref(null)
  const carouselIdx = ref(0)
  const itemsPerView = ref(3)

  // --- COMPUTED ---
  const activeFeature = computed(() => FEATURE_TABS.find((t) => t.id === activeTab.value))

  // --- METHODS ---
  const updateItemsPerView = () => {
    if (typeof globalThis === 'undefined') return
    if (globalThis.innerWidth < 768) itemsPerView.value = 1
    else if (globalThis.innerWidth < 1024) itemsPerView.value = 2
    else itemsPerView.value = 3
  }

  const nextSlide = () => {
    carouselIdx.value = (carouselIdx.value + 1) % (USE_CASES.length - itemsPerView.value + 1)
  }

  const prevSlide = () => {
    carouselIdx.value =
      (carouselIdx.value - 1 + (USE_CASES.length - itemsPerView.value + 1)) %
      (USE_CASES.length - itemsPerView.value + 1)
  }

  const isVisible = (id: string) => visibleIds.value.has(id)

  const toggleFaq = (idx: number | null) => {
    openFaqIdx.value = openFaqIdx.value === idx ? null : idx
  }

  const observeElement = (el: HTMLElement | null) => {
    if (el && observer.value) {
      observer.value.observe(el)
    }
  }

  async function fetchTestimonials() {
    isLoading.value = true
    try {
      await new Promise((r) => setTimeout(r, 600))
      return [
        {
          id: 1,
          name: 'Arjun K.',
          role: 'Beta User, Bengaluru',
          quote:
            "I scanned the code outside my clinic, saw '4 people ahead, ~18 min', and went to get coffee. Didn't think about the queue again until the buzz.",
          avatar: 'A',
        },
        {
          id: 2,
          name: 'Priya S.',
          role: 'Clinic Manager, Pune',
          quote:
            "We used a spiral notebook before this. Patients would argue about who was next. Now the screen settles it and nobody's asking me.",
          avatar: 'P',
        },
        {
          id: 3,
          name: 'Rehan M.',
          role: 'Owner, Cafe Ombre',
          quote:
            'Saturday mornings used to be 12 people crammed by the door. Now they wait outside on their phones and walk in when we call them. Same crowd, way less chaos.',
          avatar: 'R',
        },
        {
          id: 4,
          name: 'Lakshmi N.',
          role: 'Front Desk, City Aadhar Center',
          quote:
            "Our token machine broke twice a month and people would just... make up numbers. Hasn't happened once since we switched to codes on the signage.",
          avatar: 'L',
        },
        {
          id: 5,
          name: 'Farhan A.',
          role: 'Manager, Ironclad Gym',
          quote:
            "Set it up between two client sessions, no exaggeration. I was expecting a whole onboarding call and there wasn't one.",
          avatar: 'F',
        },
        {
          id: 6,
          name: 'Divya T.',
          role: 'Store Lead, Meraki Retail',
          quote:
            'One customer told our staff she left, ran an errand two blocks over, and came back right as her turn hit. That never happened when they had to physically hold a spot.',
          avatar: 'D',
        },
      ]
    } catch (e: unknown) {
      let errorMessage = 'An unexpected error occurred'
      if (e instanceof Error) {
        errorMessage = e.message
      } else if (typeof e === 'string') {
        errorMessage = e
      }
      error.value = errorMessage
      return []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    if (typeof globalThis === 'undefined') return

    updateItemsPerView()
    globalThis.addEventListener('resize', updateItemsPerView)

    isPwa.value = globalThis.matchMedia('(display-mode: standalone)').matches

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            visibleIds.value.add(entry.target.id)
          }
        })
      },
      { threshold: 0.1 },
    )

    // Observe initially present sections
    const observeSections = () => {
      document.querySelectorAll('section[id]').forEach((s) => observer.value?.observe(s))
    }
    observeSections()

    // MutationObserver to automatically discover and observe asynchronously resolved lazy components
    mutationObserver.value = new MutationObserver(() => {
      observeSections()
    })
    mutationObserver.value.observe(document.body, { childList: true, subtree: true })

    testimonials.value = await fetchTestimonials()
  })

  onUnmounted(() => {
    if (typeof globalThis !== 'undefined') {
      globalThis.removeEventListener('resize', updateItemsPerView)
    }
    observer.value?.disconnect()
    mutationObserver.value?.disconnect()
  })

  return {
    isLoading,
    error,
    HERO_DATA,
    FEATURE_TABS,
    USE_CASES,
    FAQ_LIST,
    INDUSTRY_CATEGORIES,
    testimonials,
    isPwa,
    activeTab,
    openFaqIdx,
    carouselIdx,
    itemsPerView,
    activeFeature,
    UPGRADE_DATA,
    nextSlide,
    prevSlide,
    isVisible,
    toggleFaq,
    observeElement,
  }
}
