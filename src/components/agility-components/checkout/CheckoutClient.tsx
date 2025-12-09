"use client"

import { useCart } from "@/lib/hooks/useCart"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { formatPrice } from "@/lib/utils"
import { clsx } from "clsx"
import { CartLineItem } from "@/components/cart/CartLineItem"
import { Input } from "@/components/ui/input"

interface CheckoutClientProps {
  heading: string
  description?: string
  taxRate: number
  contentID: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone?: string
  streetName: string
  streetNumber?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export function CheckoutClient({ heading, description, taxRate, contentID }: CheckoutClientProps) {
  const router = useRouter()
  const { cart } = useCart()
  const [cartLoaded, setCartLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetName: "",
    streetNumber: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US", // Default to US - only supported country
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})

  // Wait for cart to load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setCartLoaded(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setCartLoaded(true)
    }
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartLoaded && cart.items.length === 0) {
      router.push("/products")
    }
  }, [cart.items.length, router, cartLoaded])


  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ShippingAddress, string>> = {}

    if (!shippingAddress.firstName.trim()) {
      errors.firstName = "First name is required"
    }
    if (!shippingAddress.lastName.trim()) {
      errors.lastName = "Last name is required"
    }
    if (!shippingAddress.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!shippingAddress.streetName.trim()) {
      errors.streetName = "Street address is required"
    }
    if (!shippingAddress.city.trim()) {
      errors.city = "City is required"
    }
    if (!shippingAddress.state.trim()) {
      errors.state = "State is required"
    }
    if (!shippingAddress.postalCode.trim()) {
      errors.postalCode = "Postal code is required"
    }
    if (!shippingAddress.country.trim()) {
      errors.country = "Country is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout/stripe-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items,
          email: shippingAddress.email,
          shippingAddress: {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            streetName: shippingAddress.streetName,
            streetNumber: shippingAddress.streetNumber,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          currency: "USD",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create checkout session")
      }

      if (!data.url) {
        throw new Error("Invalid checkout session response")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (!cartLoaded || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center" data-agility-component={contentID}>
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {!cartLoaded ? "Loading cart..." : "Redirecting to products..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8"
      data-agility-component={contentID}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            data-agility-field="heading"
          >
            {heading}
          </h1>
          {description && (
            <p
              className="mt-2 text-gray-600 dark:text-gray-400"
              data-agility-field="description"
            >
              {description}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={clsx(
                        "mt-1",
                        formErrors.firstName && "border-red-500 dark:border-red-500"
                      )}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={clsx(
                        "mt-1",
                        formErrors.lastName && "border-red-500 dark:border-red-500"
                      )}
                      required
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={clsx(
                      "mt-1",
                      formErrors.email && "border-red-500 dark:border-red-500"
                    )}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone (Optional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h2>
                <div className="mt-4">
                  <label
                    htmlFor="streetName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Street Address *
                  </label>
                  <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <Input
                      id="streetNumber"
                      type="text"
                      placeholder="Number"
                      value={shippingAddress.streetNumber}
                      onChange={(e) => handleInputChange("streetNumber", e.target.value)}
                      className="sm:col-span-1"
                    />
                    <Input
                      id="streetName"
                      type="text"
                      placeholder="Street name"
                      value={shippingAddress.streetName}
                      onChange={(e) => handleInputChange("streetName", e.target.value)}
                      className={clsx(
                        "sm:col-span-3",
                        formErrors.streetName && "border-red-500 dark:border-red-500"
                      )}
                      required
                    />
                  </div>
                  {formErrors.streetName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.streetName}
                    </p>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      City *
                    </label>
                    <Input
                      id="city"
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={clsx(
                        "mt-1",
                        formErrors.city && "border-red-500 dark:border-red-500"
                      )}
                      required
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      State *
                    </label>
                    <Input
                      id="state"
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={clsx(
                        "mt-1",
                        formErrors.state && "border-red-500 dark:border-red-500"
                      )}
                      required
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Postal Code *
                    </label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className={clsx(
                        "mt-1",
                        formErrors.postalCode && "border-red-500 dark:border-red-500"
                      )}
                      required
                    />
                    {formErrors.postalCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Country *
                  </label>
                  <select
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className={clsx(
                      "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400",
                      formErrors.country && "border-red-500 dark:border-red-500"
                    )}
                    required
                    disabled // Only US is supported for now
                  >
                    <option value="US">United States</option>
                    {/* Only US is currently supported - products must be priced and tax rates configured for additional countries */}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Currently shipping to United States only
                  </p>
                  {formErrors.country && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  {isSubmitting ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="mt-4 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.variantSKU} className="border-b border-gray-200 pb-4 dark:border-gray-700">
                    <CartLineItem item={item} showControls={false} />
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Shipping and taxes calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
