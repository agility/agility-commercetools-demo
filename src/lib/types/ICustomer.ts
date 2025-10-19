import Stripe from "stripe"

export interface ICustomerDetails {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  address: Stripe.Address | null
  created: number
  balance: number
  currency: string | null
  defaultPaymentMethod: string | Stripe.PaymentMethod | null
  subscriptions?: ISubscription[]
}

export interface ISubscription {
  id: string
  status: Stripe.Subscription.Status
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
}

export interface IOrder {
  id: string
  status: string
  amount: number | null
  currency: string | null
  created: number
  items?: IOrderItem[]
  paymentIntentId?: string
}

export interface IOrderItem {
  description: string | null
  amount: number
  quantity: number | null
}
