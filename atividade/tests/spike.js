import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Spike Testing - Teste de Pico
 * 
 * Objetivo: Simular um comportamento de "Flash Sale" (ex: abertura de venda de ingressos)
 * Alvo: Endpoint /checkout/simple (I/O Bound - melhor para spike)
 * 
 * Cenário:
 * - Carga baixa (10 usuários) por 30s
 * - Salto imediato para 300 usuários em 10s
 * - Manter por 1 minuto
 * - Queda imediata para 10 usuários
 * 
 * Análise: Observe como a aplicação se comporta quando o tráfego pula bruscamente
 */

export const options = {
    stages: [
        { duration: '30s', target: 10 },      // Carga baixa: 10 usuários por 30 segundos
        { duration: '10s', target: 300 },     // Spike: Salto imediato para 300 usuários em 10 segundos
        { duration: '1m', target: 300 },      // Manter: 300 usuários por 1 minuto
        { duration: '10s', target: 10 }       // Queda: Voltar a 10 usuários em 10 segundos
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'],  // p95 latência < 1000ms (mais leniente durante pico)
        'http_req_failed': ['rate<0.05'],     // Menos de 5% de erro
        'checks': ['rate>0.95']               // 95%+ de checks bem-sucedidos
    }
};

export default function() {
    const payload = JSON.stringify({
        userId: Math.floor(Math.random() * 50000),
        cartItems: [
            { productId: Math.floor(Math.random() * 100), quantity: 1, price: Math.random() * 100 }
        ],
        promotionCode: 'FLASHSALE2024'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { name: 'CheckoutSimpleSpike' },
        timeout: '5s'
    };

    const res = http.post('http://localhost:3000/checkout/simple', payload, params);

    check(res, {
        'status is 201': (r) => r.status === 201,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
        'body contains APPROVED': (r) => r.body.includes('APPROVED'),
        'body contains processingTime': (r) => r.body.includes('processingTime')
    });

    sleep(Math.random() * 1.5);  // Aguarda entre 0 e 1.5 segundos
}
