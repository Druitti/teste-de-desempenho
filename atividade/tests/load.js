import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Load Testing - Teste de Carga
 * 
 * Cenário: Marketing anunciou uma promoção esperando 50 usuários simultâneos
 * Alvo: Endpoint /checkout/simple (I/O Bound)
 * 
 * Stages:
 * - Ramp-up: 0 a 50 usuários em 1 minuto
 * - Platô: Manter 50 usuários por 2 minutos
 * - Ramp-down: 50 a 0 usuários em 30 segundos
 */

export const options = {
    stages: [
        { duration: '1m', target: 50 },      // Ramp-up: 0 a 50 usuários em 1 minuto
        { duration: '2m', target: 50 },      // Platô: Manter 50 usuários por 2 minutos
        { duration: '30s', target: 0 }       // Ramp-down: 50 a 0 usuários em 30 segundos
    ],
    thresholds: {
        'http_req_duration{staticAsset:yes}': ['p(95)<500'],  // p95 latência < 500ms
        'http_req_duration': ['p(95)<500'],
        'http_req_failed': ['rate<0.01'],                      // Menos de 1% de erro
        'checks': ['rate>0.99']                                // 99%+ de checks bem-sucedidos
    }
};

export default function() {
    const payload = JSON.stringify({
        userId: Math.floor(Math.random() * 10000),
        cartItems: [
            { productId: 1, quantity: 2, price: 29.99 },
            { productId: 2, quantity: 1, price: 49.99 }
        ],
        coupon: null
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { name: 'CheckoutSimple' }
    };

    const res = http.post('http://localhost:3000/checkout/simple', payload, params);

    check(res, {
        'status is 201': (r) => r.status === 201,
        'response time < 500ms': (r) => r.timings.duration < 500,
        'body contains APPROVED': (r) => r.body.includes('APPROVED'),
        'body contains id': (r) => r.body.includes('id')
    });

    sleep(Math.random() * 2);  // Aguarda entre 0 e 2 segundos
}
