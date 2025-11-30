import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Smoke Test - Verifica se a API está de pé
 * 
 * Objetivo: Verificar se a API está respondendo antes de iniciar testes pesados
 * Config: 1 usuário por 30 segundos acessando /health
 * Critério de Sucesso: 100% de sucesso nas requisições
 */

export const options = {
    stages: [
        { duration: '30s', target: 1 }  // 1 usuário por 30 segundos
    ],
    thresholds: {
        http_req_duration: ['p(95)<200'],     // p95 latência < 200ms
        http_req_failed: ['rate<0.01'],        // Menos de 1% de erro
        checks: ['rate>0.99']                  // 99%+ de checks bem-sucedidos
    }
};

export default function() {
    const res = http.get('http://localhost:3000/health', {
        tags: { name: 'HealthCheck' }
    });

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
        'body contains status UP': (r) => r.body.includes('UP')
    });

    sleep(1);  // Aguarda 1 segundo entre requisições
}
