import { describe, expect, it } from 'vitest';
import { ENGRAVING_MAX, PET_NAME_MAX, personalizationSchema, uploadRequestSchema } from '@/lib/validation';

const base = {
  petName: 'Nala',
  petKind: 'chien' as const,
  birthDate: '2012-04-18',
  farewellDate: '2026-02-03',
  engraving: 'Toujours près de nous',
  fontKey: 'fraunces' as const,
};

describe('personalizationSchema', () => {
  it('accepte une personnalisation complète', () => {
    expect(personalizationSchema.safeParse(base).success).toBe(true);
  });

  it('accepte des dates absentes', () => {
    expect(personalizationSchema.safeParse({ ...base, birthDate: null, farewellDate: null }).success).toBe(true);
  });

  it('borne le prénom à 30 caractères', () => {
    expect(personalizationSchema.safeParse({ ...base, petName: 'a'.repeat(PET_NAME_MAX) }).success).toBe(true);
    expect(personalizationSchema.safeParse({ ...base, petName: 'a'.repeat(PET_NAME_MAX + 1) }).success).toBe(false);
  });

  it('borne la gravure à 100 caractères', () => {
    expect(personalizationSchema.safeParse({ ...base, engraving: 'a'.repeat(ENGRAVING_MAX) }).success).toBe(true);
    expect(personalizationSchema.safeParse({ ...base, engraving: 'a'.repeat(ENGRAVING_MAX + 1) }).success).toBe(false);
  });

  it('refuse un prénom vide', () => {
    expect(personalizationSchema.safeParse({ ...base, petName: '   ' }).success).toBe(false);
  });

  it('refuse des dates incohérentes', () => {
    const result = personalizationSchema.safeParse({ ...base, birthDate: '2026-02-03', farewellDate: '2012-04-18' });
    expect(result.success).toBe(false);
  });

  it('accepte une même date d’arrivée et de départ', () => {
    expect(
      personalizationSchema.safeParse({ ...base, birthDate: '2020-01-01', farewellDate: '2020-01-01' }).success,
    ).toBe(true);
  });
});

describe('uploadRequestSchema', () => {
  const upload = {
    fileName: 'nala.jpg',
    mimeType: 'image/jpeg' as const,
    sizeBytes: 2_000_000,
    consentGiven: true as const,
    consentTextVersion: '2026-08-consentement-photo-v1',
  };

  it('accepte un JPG de 2 Mo avec consentement', () => {
    expect(uploadRequestSchema.safeParse(upload).success).toBe(true);
  });

  it('refuse un fichier de plus de 10 Mo', () => {
    expect(uploadRequestSchema.safeParse({ ...upload, sizeBytes: 10 * 1024 * 1024 + 1 }).success).toBe(false);
  });

  it('refuse un format non pris en charge', () => {
    expect(uploadRequestSchema.safeParse({ ...upload, mimeType: 'application/pdf' }).success).toBe(false);
  });

  it('refuse un upload sans consentement explicite', () => {
    expect(uploadRequestSchema.safeParse({ ...upload, consentGiven: false }).success).toBe(false);
  });
});
