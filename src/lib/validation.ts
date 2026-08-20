import { z } from 'zod';

/** Longueurs imposées par la gravure — voir le brief, étape 4 du configurateur. */
export const PET_NAME_MAX = 30;
export const ENGRAVING_MAX = 100;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date attendu : AAAA-MM-JJ')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Cette date n’existe pas.');

export const personalizationSchema = z
  .object({
    petName: z
      .string()
      .trim()
      .min(1, 'Merci d’indiquer le prénom de votre compagnon.')
      .max(PET_NAME_MAX, `${PET_NAME_MAX} caractères maximum.`),
    petKind: z.enum(['chien', 'chat']),
    birthDate: isoDate.nullable(),
    farewellDate: isoDate.nullable(),
    engraving: z
      .string()
      .trim()
      .max(ENGRAVING_MAX, `${ENGRAVING_MAX} caractères maximum.`)
      .nullable(),
    fontKey: z.enum(['fraunces', 'inter']).default('fraunces'),
  })
  .refine(
    (data) =>
      !data.birthDate || !data.farewellDate || Date.parse(data.birthDate) <= Date.parse(data.farewellDate),
    { message: 'La date d’arrivée doit précéder la date de départ.', path: ['farewellDate'] },
  );

export type Personalization = z.infer<typeof personalizationSchema>;

export const weightClassSchema = z.enum(['lt_5', '5_15', '15_30', 'gt_30']);
export const materialSchema = z.enum(['bois_clair', 'bois_fonce', 'ceramique_blanche']);

/** Ce que le client envoie au serveur : des identifiants, jamais des montants. */
export const checkoutIntentSchema = z.object({
  bundleSlug: z.string().min(1),
  variantId: z.uuid().nullable(),
  optionSlugs: z.array(z.string().min(1)).max(10),
  personalization: personalizationSchema,
  photoAssetId: z.uuid().nullable(),
  promoCode: z.string().trim().max(32).nullable(),
  cremationTiming: z.enum(['post_cremation', 'pre_cremation']),
  email: z.email('Merci de vérifier cette adresse email.'),
});

export type CheckoutIntent = z.infer<typeof checkoutIntentSchema>;

/** Contraintes d'upload : 10 Mo, formats photo courants du parc mobile. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'] as const;

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ACCEPTED_IMAGE_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES, 'Fichier trop lourd : 10 Mo maximum.'),
  consentGiven: z.literal(true, 'Votre accord est nécessaire pour héberger cette photo.'),
  consentTextVersion: z.string().min(1),
});
