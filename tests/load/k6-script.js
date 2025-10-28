import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * Script de carga para k6
 * Simula 50 usuarios accediendo al endpoint de productos durante 30 segundos
 * Ejecutar: k6 run tests/load/k6-script.js
 */

// Métricas personalizadas
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Ramp-up: 10 usuarios en 10 seg
    { duration: '20s', target: 50 },   // Subir a 50 usuarios
    { duration: '30s', target: 50 },   // Mantener 50 usuarios
    { duration: '10s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests debajo de 2s
    http_req_failed: ['rate<0.1'],      // Menos del 10% de errores
    errors: ['rate<0.1'],
  },
};

export default function () {
  // Test de página principal
  const homeResponse = http.get('http://localhost:3000/');
  check(homeResponse, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  errorRate.add(homeResponse.status !== 200);
  responseTime.add(homeResponse.timings.duration);

  sleep(1);

  // Test de página de productos
  const productosResponse = http.get('http://localhost:3000/productos');
  check(productosResponse, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });
  errorRate.add(productosResponse.status !== 200);
  responseTime.add(productosResponse.timings.duration);

  sleep(1);
}

// Función de teardown
export function teardown(data) {
  console.log('Test de carga completado');
}

