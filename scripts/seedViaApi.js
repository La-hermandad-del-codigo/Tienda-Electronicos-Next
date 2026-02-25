#!/usr/bin/env node

/**
 * Script para ejecutar el seed de productos a través de la API
 * Uso: node scripts/seedViaApi.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const SEED_TOKEN = process.env.SEED_SECRET_TOKEN || 'seed123';

async function seedViaApi() {
  try {
    console.log('🌱 Iniciando seed de productos...');
    console.log(`📡 Conectando a: ${API_URL}/api/seed\n`);

    const response = await fetch(`${API_URL}/api/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'clean-and-seed',
        token: SEED_TOKEN,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error);
      process.exit(1);
    }

    console.log('✅ ' + data.message);
    console.log(`📊 Productos insertados: ${data.count}`);
    console.log('\n✨ ¡Base de datos actualizada correctamente!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seedViaApi();
