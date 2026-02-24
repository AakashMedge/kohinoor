'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
  // In a real app we'd attach to logged in user's shop_id
  const SHOP_ID = 1;

  // Mock Shop Details like Mahavir Jewellers
  const shopCheck = await db`SELECT id FROM shops WHERE id = ${SHOP_ID}`;
  if (shopCheck.length === 0) {
    await db`INSERT INTO shops (id, name, gstin, address, bank_details, bis_license, cin_number) 
             VALUES (${SHOP_ID}, 'MAHAVIR JEWELLERS', '27AECPJ5690P1ZV', 'PALM ROSE BILD. SHOP NO 10 ROAD NO 16 MAHESHWERI NAGAR MIDC ANDHERI EAST 400093', 'A/C Name: MAHAVIR JEWELLERS\nBank Name: KOTAK MAHINDRA BANK\nBranch: MIDC CROSS ROAD\nAccount No.: 9920099375\nIFSC Code: KKBK0001367', 'HM/C-7790042022', '')`;
  }

  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerPan = formData.get('customerPan') as string || null;
  const customerAadhaar = formData.get('customerAadhaar') as string || null;
  const customerAddress = formData.get('customerAddress') as string || null;

  // Create / Find customer
  let customerId;
  const existingCustomers = await db`SELECT id FROM customers WHERE phone = ${customerPhone} LIMIT 1`;
  if (existingCustomers.length > 0) {
    customerId = existingCustomers[0].id;
    // Update missing fields
    await db`UPDATE customers SET pan = COALESCE(${customerPan}, pan), aadhaar = COALESCE(${customerAadhaar}, aadhaar), address = COALESCE(${customerAddress}, address) WHERE id = ${customerId}`;
  } else {
    const newCust = await db`INSERT INTO customers (shop_id, name, phone, pan, aadhaar, address) VALUES (${SHOP_ID}, ${customerName}, ${customerPhone}, ${customerPan}, ${customerAadhaar}, ${customerAddress}) RETURNING id`;
    customerId = newCust[0].id;
  }

  // Generate Invoice Number format 90/25-26
  const yr = new Date().getFullYear();
  const c = await db`SELECT count(id) as c FROM invoices WHERE shop_id = ${SHOP_ID} AND extract(year from created_at) = ${yr}`;
  const nextNum = Number(c[0].c) + 1;
  const invNumber = `${nextNum}/25-26`;

  const invDate = formData.get('date') as string;
  const financialYear = '2025-26';

  const goldRate = Number(formData.get('goldRate') || 0);

  const itemsJson = formData.get('itemsData') as string;
  const items = JSON.parse(itemsJson);

  let totalNetWt = 0;
  let totalAmount = 0;

  for (const item of items) {
    totalNetWt += Number(item.net_weight);
    totalAmount += Number(item.amount);
  }

  // Calculate taxes precisely
  const cgst = Number((totalAmount * 0.015).toFixed(2));
  const sgst = Number((totalAmount * 0.015).toFixed(2));
  const exactTotal = totalAmount + cgst + sgst;
  const grandTotal = Math.round(exactTotal);

  // Payment Breakdown
  const advance = Number(formData.get('advance') || 0);
  const cards = Number(formData.get('cards') || 0);
  const cash = Number(formData.get('cash') || 0);
  const digital = Number(formData.get('digital') || 0);
  const balance = Number(formData.get('balance') || 0);

  const newInvoice = await db`
    INSERT INTO invoices (
      shop_id, customer_id, invoice_number, date, total_net_weight, total_amount, 
      cgst, sgst, grand_total, payment_mode, financial_year, gold_rate,
      advance_amount, cards_amount, cash_amount, digital_amount, balance_amount, customer_address
    )
    VALUES (
      ${SHOP_ID}, ${customerId}, ${invNumber}, ${invDate}, ${totalNetWt}, ${totalAmount}, 
      ${cgst}, ${sgst}, ${grandTotal}, 'SPLIT DETAILS', ${financialYear}, ${goldRate},
      ${advance}, ${cards}, ${cash}, ${digital}, ${balance}, ${customerAddress}
    )
    RETURNING id
  `;

  const newInvoiceId = newInvoice[0].id;

  for (const item of items) {
    await db`
      INSERT INTO invoice_items (invoice_id, description, huid, hsn, purity, gross_weight, net_weight, rate, amount)
      VALUES (${newInvoiceId}, ${item.description}, ${item.huid}, ${item.hsn}, ${item.purity}, ${item.gross_weight}, ${item.net_weight}, ${item.rate}, ${item.amount})
    `;
  }

  revalidatePath('/');
  redirect(`/invoices/${newInvoiceId}`);
}
