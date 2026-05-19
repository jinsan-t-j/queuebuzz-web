import { ref, type Ref } from 'vue'

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap
  remove: () => void
}

interface LeafletMarker {
  setLatLng: (latlng: [number, number]) => LeafletMarker
  addTo: (map: LeafletMap) => LeafletMarker
  on: (event: string, fn: () => void) => void
  getLatLng: () => { lat: number; lng: number }
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer
  remove: () => void
}

interface WindowWithL extends Window {
  L?: {
    map: (id: string, options?: Record<string, unknown>) => LeafletMap
    tileLayer: (url: string, options?: Record<string, unknown>) => LeafletTileLayer
    divIcon: (options?: Record<string, unknown>) => unknown
    marker: (latlng: [number, number], options?: Record<string, unknown>) => LeafletMarker
    circle: (
      latlng: [number, number],
      options?: Record<string, unknown>,
    ) => { addTo: (map: LeafletMap) => void }
  }
}

export function useLocation(
  customLatitude?: Ref<number | null>,
  customLongitude?: Ref<number | null>,
) {
  const latitude = customLatitude || ref<number | null>(null)
  const longitude = customLongitude || ref<number | null>(null)
  const isLocating = ref(false)
  const isRefreshingLocation = ref(false)
  const geoError = ref<string | null>(null)
  const isSatellite = ref(false)

  const locationName = ref('')
  const isFetchingPlace = ref(false)

  const fetchPlaceName = async (lat: number, lon: number) => {
    isFetchingPlace.value = true
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'QueueBuzz/1.0',
          },
        },
      )
      const data = await res.json()
      if (data?.address) {
        const address = data.address
        const place = address.suburb || address.neighbourhood || address.road || ''
        const city = address.city || address.town || address.village || ''
        const state = address.state || ''
        locationName.value = [place, city, state].filter(Boolean).join(', ')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Reverse geocoding error:', err)
    } finally {
      isFetchingPlace.value = false
    }
  }

  let leafletMap: LeafletMap | null = null
  let leafletMarker: LeafletMarker | null = null
  let streetLayer: LeafletTileLayer | null = null
  let satelliteLayer: LeafletTileLayer | null = null

  const toggleMapType = () => {
    const win = globalThis as unknown as WindowWithL
    const L = win.L
    if (!L || !leafletMap) return

    isSatellite.value = !isSatellite.value

    if (isSatellite.value) {
      if (streetLayer) {
        streetLayer.remove()
      }
      if (!satelliteLayer) {
        satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        )
      }
      satelliteLayer.addTo(leafletMap)
    } else {
      if (satelliteLayer) {
        satelliteLayer.remove()
      }
      if (!streetLayer) {
        streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      }
      streetLayer.addTo(leafletMap)
    }
  }

  const setupLeaflet = (
    elementId: string,
    venueLatitude: number | null,
    venueLongitude: number | null,
    geoRadiusMeters: number,
    options: { draggable?: boolean } = {},
  ) => {
    const win = globalThis as unknown as WindowWithL
    const L = win.L
    const mapEl = document.getElementById(elementId)
    const centerLat = venueLatitude || latitude.value
    const centerLng = venueLongitude || longitude.value
    if (!L || !mapEl || !centerLat || !centerLng) return

    try {
      const map = L.map(elementId, {
        zoomControl: false,
        attributionControl: false,
      }).setView([centerLat, centerLng], 17)

      streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      )

      if (isSatellite.value) {
        satelliteLayer.addTo(map)
      } else {
        streetLayer.addTo(map)
      }

      if (options.draggable) {
        const customIcon = L.divIcon({
          html: `<svg class="w-9 h-11 filter drop-shadow-[0_4px_6px_rgba(26,10,46,0.3)] transition-transform duration-200 hover:scale-110" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="#1A0A2E" stroke="#FFFFFF" stroke-width="2"/>
                   <circle cx="18" cy="18" r="6" fill="#00E5A0" stroke="#FFFFFF" stroke-width="1.5"/>
                 </svg>`,
          className: 'custom-pin-icon',
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        })

        const marker = L.marker([centerLat, centerLng], {
          draggable: true,
          icon: customIcon,
        })

        leafletMarker = marker.addTo(map)

        leafletMarker.on('dragend', () => {
          const pos = marker.getLatLng()
          latitude.value = pos.lat
          longitude.value = pos.lng
          fetchPlaceName(pos.lat, pos.lng)
        })
      } else {
        if (venueLatitude && venueLongitude) {
          L.circle([venueLatitude, venueLongitude], {
            color: '#00E5A0',
            fillColor: '#00E5A0',
            fillOpacity: 0.15,
            radius: geoRadiusMeters,
            weight: 1.5,
          }).addTo(map)

          const venueIcon = L.divIcon({
            html: `<svg class="w-9 h-11 filter drop-shadow-[0_4px_6px_rgba(26,10,46,0.3)]" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="#1A0A2E" stroke="#FFFFFF" stroke-width="2"/>
                     <circle cx="18" cy="18" r="6" fill="#00E5A0" stroke="#FFFFFF" stroke-width="1.5"/>
                   </svg>`,
            className: 'venue-pin-icon',
            iconSize: [36, 44],
            iconAnchor: [18, 44],
          })
          L.marker([venueLatitude, venueLongitude], { icon: venueIcon }).addTo(map)
        }

        if (latitude.value && longitude.value) {
          const guestIcon = L.divIcon({
            html: `<div class="relative w-8 h-8 rounded-full bg-white border-2 border-[#1A0A2E] flex items-center justify-center shadow-lg">
                     <div class="w-3.5 h-3.5 rounded-full bg-mint animate-pulse"></div>
                   </div>`,
            className: 'guest-pin-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
          leafletMarker = L.marker([latitude.value, longitude.value], { icon: guestIcon }).addTo(
            map,
          )
        }
      }

      leafletMap = map
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Leaflet map:', err)
    }
  }

  const initLeafletMap = (
    elementId: string,
    venueLatitude: number | null,
    venueLongitude: number | null,
    geoRadiusMeters: number,
    options: { draggable?: boolean } = {},
  ) => {
    if (leafletMap) {
      const centerLat = venueLatitude || latitude.value || 0
      const centerLng = venueLongitude || longitude.value || 0
      leafletMap.setView([centerLat, centerLng], 17)
      if (leafletMarker && options.draggable) {
        leafletMarker.setLatLng([centerLat, centerLng])
      }
      return
    }

    const win = globalThis as unknown as WindowWithL
    if (win.L) {
      setupLeaflet(elementId, venueLatitude, venueLongitude, geoRadiusMeters, options)
    } else {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        setupLeaflet(elementId, venueLatitude, venueLongitude, geoRadiusMeters, options)
      }
      document.head.appendChild(script)
    }
  }

  const destroyLeafletMap = () => {
    if (leafletMap) {
      try {
        leafletMap.remove()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error destroying Leaflet map:', err)
      }
      leafletMap = null
      leafletMarker = null
      streetLayer = null
      satelliteLayer = null
    }
  }

  const refreshMyLocation = () => {
    isRefreshingLocation.value = true
    geoError.value = null

    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude.value = position.coords.latitude
          longitude.value = position.coords.longitude
          isRefreshingLocation.value = false

          if (leafletMap) {
            leafletMap.setView([latitude.value, longitude.value], 17)

            const win = globalThis as unknown as WindowWithL
            const L = win.L
            if (L) {
              if (leafletMarker) {
                leafletMarker.setLatLng([latitude.value, longitude.value])
              } else {
                const guestIcon = L.divIcon({
                  html: `<div class="relative w-8 h-8 rounded-full bg-white border-2 border-[#1A0A2E] flex items-center justify-center shadow-lg">
                           <div class="w-3.5 h-3.5 rounded-full bg-mint animate-pulse"></div>
                         </div>`,
                  className: 'guest-pin-icon',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })
                leafletMarker = L.marker([latitude.value, longitude.value], {
                  icon: guestIcon,
                }).addTo(leafletMap)
              }
            }
          }
          resolve({ latitude: latitude.value, longitude: longitude.value })
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('Guest refresh location error:', err)
          geoError.value =
            "Failed to retrieve your location. Please check your browser's location permissions."
          isRefreshingLocation.value = false
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }

  const captureLocation = () => {
    isLocating.value = true
    geoError.value = null

    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude.value = position.coords.latitude
          longitude.value = position.coords.longitude
          isLocating.value = false
          resolve({ latitude: latitude.value, longitude: longitude.value })
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('Guest geolocation error:', err)
          geoError.value =
            "Failed to retrieve your location. Please check your browser's location permissions."
          isLocating.value = false
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }

  return {
    latitude,
    longitude,
    isLocating,
    isRefreshingLocation,
    geoError,
    isSatellite,
    locationName,
    isFetchingPlace,
    fetchPlaceName,
    toggleMapType,
    initLeafletMap,
    destroyLeafletMap,
    refreshMyLocation,
    captureLocation,
  }
}
