import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Stress Testing - Teste de Estresse
 * 
 * Objetivo: Encontrar o ponto de ruptura (Breaking Point) da aplicação
 * Pergunta: Quantos usuários fazendo cálculos de criptografia (CPU Heavy) derrubam o servidor?
 * 
 * Alvo: Endpoint /checkout/crypto (CPU Bound)
 * 
 * Cenário: Aumento agressivo de carga
 * - 0 a 200 usuários em 2 minutos
 * - 200 a 500 usuários em 2 minutos
 * - 500 a 1000 usuários em 2 minutos
 * 
 * Análise: Observe o momento exato em que tempos de resposta começam a subir 
 * exponencialmente ou ocorrem Timeouts (Ponto de Ruptura)
 */

export const options = {
    stages: [
        { duration: '2m', target: 200 },     // Ramp-up: 0 a 200 usuários em 2 minutos
        { duration: '2m', target: 500 },     // Intensify: 200 a 500 usuários em 2 minutos
        { duration: '2m', target: 1000 }     // Peak: 500 a 1000 usuários em 2 minutos
    ],
    thresholds: {
        'http_req_duration': ['p(95)<2000'],    // p95 latência < 2000ms (mais leniente para teste de estresse)
        'http_req_failed': ['rate<0.10'],       // Até 10% de erro é aceitável em estresse
        'checks': ['rate>0.90']                 // 90%+ de checks bem-sucedidos
    }
};

export default function() {
    const payload = JSON.stringify({
        userId: Math.floor(Math.random() * 100000),
        transactionAmount: Math.floor(Math.random() * 1000) + 100,
        securityLevel: 'HIGH'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { name: 'CheckoutCrypto' },
        timeout: '10s'
    };

    const res = http.post('http://localhost:3000/checkout/crypto', payload, params);

    check(res, {
        'status is 201': (r) => r.status === 201,
        'body contains SECURE_TRANSACTION': (r) => r.body.includes('SECURE_TRANSACTION'),
        'body contains hash': (r) => r.body.includes('hash'),
        'request completed': (r) => r.status < 500
    });

    sleep(Math.random() * 1);  // Aguarda entre 0 e 1 segundo
}
