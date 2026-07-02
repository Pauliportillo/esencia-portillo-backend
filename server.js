const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const planes = {
  principiante: { title: 'Plan Principiante – $15.99 USD', price: 22326 },
  intermedio: { title: 'Plan Intermedio – $34.99 USD', price: 48814 },
  profesional: { title: 'Plan Profesional – $49.95 USD', price: 69680 }
};

app.post('/crear-pago', async (req, res) => {
  try {
    const { plan } = req.body;
    const planSeleccionado = planes[plan];

    if (!planSeleccionado) {
      return res.status(400).json({ error: 'Plan no válido' });
    }

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{
          title: planSeleccionado.title,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: planSeleccionado.price
        }],
        payment_methods: {
          installments: 1
        },
        back_urls: {
          success: 'https://esencia-portillo.netlify.app/#membresias',
          failure: 'https://esencia-portillo.netlify.app/#membresias',
          pending: 'https://esencia-portillo.netlify.app/#membresias'
        },
        auto_return: 'approved'
      }
    });

    res.json({ url: result.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
});

app.listen(3001, () => {
  console.log('Backend corriendo en puerto 3001');
});