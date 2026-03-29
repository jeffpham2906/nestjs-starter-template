import { z } from 'zod';

export const UserId = z.uuidv4().trim().brand('UserId');
export type UserId = z.infer<typeof UserId>;

export const SpecimenId = z.uuidv4().trim().brand('SpecimenId');
export type SpecimenId = z.infer<typeof SpecimenId>;
