import { z } from 'zod';
import { messages } from './messages';

/**
 * Schemas de validação centralizados com mensagens claras
 */

// Validação de email
export const emailSchema = z
  .string()
  .min(1, messages.auth.invalidEmail.description)
  .email(messages.auth.invalidEmail.description)
  .max(255, 'Email muito longo');

// Validação de senha
export const passwordSchema = z
  .string()
  .min(6, messages.auth.weakPassword.description)
  .max(100, 'Senha muito longa');

// Validação de nome
export const nameSchema = z
  .string()
  .min(1, 'Digite seu nome')
  .max(100, 'Nome muito longo')
  .trim();

// Validação de produto
export const productSchema = z.object({
  name: z
    .string()
    .min(1, messages.products.nameRequired.description)
    .max(200, 'Nome muito longo')
    .trim(),
  price: z
    .string()
    .min(1, messages.products.priceRequired.description)
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: messages.products.invalidPrice.description
    }),
  description: z
    .string()
    .min(1, messages.products.descriptionRequired.description)
    .max(2000, 'Descrição muito longa')
    .trim(),
  category_id: z.string().optional(),
  code: z.string().optional(),
  weight: z.string().optional(),
  cost: z.string().optional(),
  discount: z.string().optional()
});

// Validação de categoria
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, messages.categories.nameRequired.description)
    .max(100, 'Nome muito longo')
    .trim(),
  image_url: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  is_active: z.boolean().default(true)
});

// Validação de URL de loja
export const storeUrlSchema = z
  .string()
  .min(3, 'A URL deve ter pelo menos 3 caracteres')
  .max(50, 'A URL deve ter no máximo 50 caracteres')
  .regex(/^[a-z0-9-]+$/, messages.profile.invalidStoreUrl.description)
  .trim();

// Validação de WhatsApp
export const whatsappSchema = z
  .string()
  .regex(/^\d{10,11}$/, messages.profile.whatsappInvalid.description)
  .optional()
  .or(z.literal(''));

// Validação de link customizado
export const customLinkSchema = z.object({
  title: z
    .string()
    .min(1, messages.customLinks.titleRequired.description)
    .max(100, 'Título muito longo')
    .trim(),
  url: z
    .string()
    .min(1, messages.customLinks.urlRequired.description)
    .url(messages.customLinks.invalidUrl.description),
  icon: z.string().optional(),
  is_active: z.boolean().default(true)
});

// Validação de lead capture
export const leadCaptureSchema = z.object({
  name: z
    .string()
    .min(1, messages.leads.nameRequired.description)
    .max(100, 'Nome muito longo')
    .trim(),
  phone: z
    .string()
    .min(10, messages.leads.invalidPhone.description)
    .max(11, messages.leads.invalidPhone.description)
    .regex(/^\d+$/, messages.leads.invalidPhone.description),
  city: z
    .string()
    .min(1, 'Digite sua cidade')
    .max(100, 'Nome da cidade muito longo')
    .trim()
});

// Validação de perfil/configurações
export const profileUpdateSchema = z.object({
  store_name: z
    .string()
    .min(1, messages.profile.storeNameRequired.description)
    .max(100, 'Nome muito longo')
    .trim(),
  store_url: storeUrlSchema,
  store_description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional(),
  whatsapp_number: whatsappSchema,
  instagram_url: z
    .string()
    .url('URL do Instagram inválida')
    .optional()
    .or(z.literal(''))
});

// Helper para validar tamanho de arquivo
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// Helper para validar tipo de arquivo
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => file.type.startsWith(type));
};

// Helper para validar imagem
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!validateFileSize(file, 5)) {
    return {
      valid: false,
      error: messages.products.imageTooBig.description
    };
  }

  if (!validateFileType(file, ['image/'])) {
    return {
      valid: false,
      error: messages.products.invalidImageFormat.description
    };
  }

  return { valid: true };
};

// Helper para formatar erros do Zod de forma amigável
export const formatZodError = (error: z.ZodError): string => {
  return error.errors[0]?.message || messages.general.error.description;
};
