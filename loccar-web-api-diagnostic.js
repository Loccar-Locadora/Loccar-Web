// Script para testar conectividade da API - Execute no console do navegador
// Copie e cole este código no console (F12 -> Console)

console.log('🔍 Iniciando diagnóstico da API Loccar...');

const BASE_URL = 'http://localhost:8080/api';
const VEHICLE_ENDPOINT = `${BASE_URL}/vehicle/list/available`;

// Função para testar conectividade básica
async function testBasicConnectivity() {
  console.log('\n📡 Teste 1: Conectividade Básica');
  
  try {
    const response = await fetch(VEHICLE_ENDPOINT, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Status:', response.status, response.statusText);
    console.log('✅ Headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      return true;
    } else {
      console.log('❌ Resposta não OK:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Erro de conectividade:', error);
    return false;
  }
}

// Função para testar com token
async function testWithToken() {
  console.log('\n🔐 Teste 2: Autenticação');
  
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log('⚠️ Token não encontrado no localStorage');
    return false;
  }
  
  console.log('✅ Token encontrado (primeiros 20 chars):', token.substring(0, 20) + '...');
  
  try {
    const response = await fetch(VEHICLE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Status com token:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados com autenticação:', data);
      return true;
    } else {
      console.log('❌ Erro com token:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Erro de autenticação:', error);
    return false;
  }
}

// Função para testar CORS
async function testCORS() {
  console.log('\n🌐 Teste 3: CORS (Cross-Origin Resource Sharing)');
  
  try {
    const response = await fetch(VEHICLE_ENDPOINT, {
      method: 'OPTIONS'
    });
    
    console.log('✅ CORS Status:', response.status);
    console.log('✅ CORS Headers:', [...response.headers.entries()]);
    
    const accessControlAllowOrigin = response.headers.get('Access-Control-Allow-Origin');
    const accessControlAllowMethods = response.headers.get('Access-Control-Allow-Methods');
    
    console.log('🔍 Access-Control-Allow-Origin:', accessControlAllowOrigin);
    console.log('🔍 Access-Control-Allow-Methods:', accessControlAllowMethods);
    
    return response.ok;
  } catch (error) {
    console.error('❌ Erro CORS:', error);
    return false;
  }
}

// Função para testar URLs alternativas
async function testAlternativeUrls() {
  console.log('\n🔄 Teste 4: URLs Alternativas');
  
  const alternativeUrls = [
    'http://127.0.0.1:8080/api/vehicle/list/available',
    'http://localhost:3000/api/vehicle/list/available',
    'https://localhost:8080/api/vehicle/list/available'
  ];
  
  for (const url of alternativeUrls) {
    try {
      console.log(`🔍 Testando: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
      });
      
      if (response.ok) {
        console.log(`✅ ${url} está funcionando!`);
        return url;
      } else {
        console.log(`❌ ${url} retornou ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${url} falhou:`, error.message);
    }
  }
  
  return null;
}

// Função principal
async function runDiagnostics() {
  console.log('🚀 Executando diagnóstico completo...\n');
  
  const results = {
    basicConnectivity: await testBasicConnectivity(),
    authentication: await testWithToken(),
    cors: await testCORS(),
    alternativeUrl: await testAlternativeUrls()
  };
  
  console.log('\n📊 Resumo dos Testes:');
  console.log('='.repeat(50));
  console.log('Conectividade Básica:', results.basicConnectivity ? '✅ OK' : '❌ FALHOU');
  console.log('Autenticação:', results.authentication ? '✅ OK' : '❌ FALHOU');
  console.log('CORS:', results.cors ? '✅ OK' : '❌ FALHOU');
  console.log('URL Alternativa:', results.alternativeUrl || '❌ NENHUMA FUNCIONOU');
  
  // Sugestões baseadas nos resultados
  console.log('\n💡 Sugestões:');
  if (!results.basicConnectivity) {
    console.log('🔧 O servidor backend não está respondendo. Verifique se ele está rodando na porta 8080.');
  }
  if (!results.authentication && results.basicConnectivity) {
    console.log('🔧 Problema de autenticação. Tente fazer login novamente.');
  }
  if (!results.cors) {
    console.log('🔧 Configure CORS no servidor backend para permitir requisições do frontend.');
  }
  if (results.alternativeUrl) {
    console.log(`🔧 Considere usar a URL alternativa: ${results.alternativeUrl}`);
  }
  
  return results;
}

// Executar o diagnóstico
runDiagnostics().then(() => {
  console.log('\n✨ Diagnóstico concluído!');
}).catch(error => {
  console.error('💥 Erro durante o diagnóstico:', error);
});

// Função auxiliar para testar manualmente
window.testLoccarAPI = runDiagnostics;