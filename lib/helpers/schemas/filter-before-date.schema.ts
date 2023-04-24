import * as z from 'zod';

export const filterBeforeDateSchema = z.string().datetime({ precision: 3 });
