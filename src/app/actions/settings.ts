'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveSettings(formData: FormData) {
  const SHOP_ID = 1; // MVP multi-tenant baseline

  const name = formData.get('name') as string;
  const tagline = formData.get('tagline') as string;
  const gstin = formData.get('gstin') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const bank_details = formData.get('bank_details') as string;
  const bis_license = formData.get('bis_license') as string;
  const cin_number = formData.get('cin_number') as string;

  await db`
    INSERT INTO shops (id, name, tagline, gstin, email, phone, address, bank_details, bis_license, cin_number)
    VALUES (${SHOP_ID}, ${name}, ${tagline}, ${gstin}, ${email}, ${phone}, ${address}, ${bank_details}, ${bis_license}, ${cin_number})
    ON CONFLICT (id) 
    DO UPDATE SET 
      name = EXCLUDED.name,
      tagline = EXCLUDED.tagline,
      gstin = EXCLUDED.gstin,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      bank_details = EXCLUDED.bank_details,
      bis_license = EXCLUDED.bis_license,
      cin_number = EXCLUDED.cin_number
  `;

  revalidatePath('/settings');
  revalidatePath('/');
  redirect('/settings?success=1');
}
