import { z } from 'zod'

// Sanitização: remover HTML/scripts de strings
const safeString = (max = 255) =>
  z.string()
    .max(max, `Máximo ${max} caracteres`)
    .transform(s => s.trim().replace(/<[^>]*>/g, ''))

const cpf = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido')
const phone = z.string().regex(/^(\+55)?\d{10,11}$/, 'Telefone inválido')
const pixKey = z.string().min(3).max(77)
const moneyBRL = z.number().positive().max(100000) // máx R$100k por transação
const url = z.string().url('URL inválida').max(500)

export const schemas = {
  
  register: z.object({
    name: safeString(100),
    email: z.string().email('Email inválido').max(255),
    password: z.string()
      .min(8, 'Mínimo 8 caracteres')
      .max(100)
      .regex(/[A-Z]/, 'Precisa de letra maiúscula')
      .regex(/[0-9]/, 'Precisa de número'),
    document: cpf,
    phone: phone.optional(),
  }),

  login: z.object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(100),
  }),

  createProduct: z.object({
    name: safeString(100),
    description: safeString(2000).optional(),
    price: moneyBRL,
    currency: z.literal('BRL'),
    type: z.enum(['SINGLE', 'SUBSCRIPTION', 'INSTALLMENT']),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens').max(60),
  }),

  createCheckoutOrder: z.object({
    buyerName: safeString(100),
    buyerEmail: z.string().email().max(255),
    buyerCpf: cpf.optional(),
    buyerPhone: phone.optional(),
    customFields: z.record(z.string().max(500)).optional(),
  }),

  createWebhook: z.object({
    url: url,
    events: z.array(z.enum([
      'order.created', 'order.paid', 'order.failed',
      'order.refunded', 'order.chargeback',
      'withdrawal.requested', 'withdrawal.completed', 'withdrawal.failed'
    ])).min(1).max(10),
  }),

  requestWithdrawal: z.object({
    amount: z.number().min(30, 'Mínimo R$30').max(50000),
    pixKey: pixKey,
    pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
  }),

  updateProfile: z.object({
    name: safeString(100).optional(),
    phone: phone.optional(),
    pixKey: pixKey.optional(),
    pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
  }),

  kycSubmit: z.object({
    cpf: cpf,
    fullName: safeString(150),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    phone: phone,
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    address: safeString(200),
    addressNumber: safeString(10),
    neighborhood: safeString(100),
    city: safeString(100),
    state: z.string().length(2),
  }),

}
