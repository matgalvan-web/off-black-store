import { client, Preference } from '../../../lib/mercadopago';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { items, orderId, shippingInfo } = await req.json();

    const preference = new Preference(client);

    const mpItems = items.map((item) => ({
      id: String(item.product_id),
      title: item.nombre + (item.color ? ` - ${item.color}` : '') + (item.size ? ` (Talle ${item.size})` : ''),
      quantity: item.cantidad,
      unit_price: item.precio,
      currency_id: 'ARS',
    }));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://off-black-store.vercel.app';

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: shippingInfo?.name || '',
          email: shippingInfo?.email || '',
          phone: { number: shippingInfo?.phone || '' },
          address: { street_name: shippingInfo?.address || '' },
        },
        back_urls: {
          success: `${baseUrl}/pago/exitoso?order_id=${orderId}`,
          failure: `${baseUrl}/pago/fallido?order_id=${orderId}`,
          pending: `${baseUrl}/pago/pendiente?order_id=${orderId}`,
        },
        auto_return: 'approved',
        external_reference: String(orderId),
        statement_descriptor: 'OFF-BLACK STORE',
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error('MercadoPago error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
