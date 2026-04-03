import { useState, useEffect, useMemo } from 'react'
import { Search, Copy, Check, ChevronDown, ChevronUp, Sun, Moon, Languages } from 'lucide-react'

// ── i18n ──────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'HTTP Status Codes',
    subtitle: 'Complete reference for HTTP status codes with descriptions and usage examples. Client-side only.',
    searchPlaceholder: 'Search by code or name... (e.g. 404, Not Found)',
    noResults: 'No status codes match your search.',
    clearSearch: 'Clear search',
    copy: 'Copy code',
    copied: 'Copied!',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    usage: 'Usage example',
    spec: 'RFC / Spec',
    categories: {
      '1xx': 'Informational',
      '2xx': 'Success',
      '3xx': 'Redirection',
      '4xx': 'Client Error',
      '5xx': 'Server Error',
    },
    builtBy: 'Built by',
  },
  pt: {
    title: 'Codigos de Status HTTP',
    subtitle: 'Referencia completa de codigos de status HTTP com descricoes e exemplos de uso. Roda no navegador.',
    searchPlaceholder: 'Buscar por codigo ou nome... (ex: 404, Not Found)',
    noResults: 'Nenhum codigo encontrado para esta busca.',
    clearSearch: 'Limpar busca',
    copy: 'Copiar codigo',
    copied: 'Copiado!',
    expandAll: 'Expandir tudo',
    collapseAll: 'Recolher tudo',
    usage: 'Exemplo de uso',
    spec: 'RFC / Spec',
    categories: {
      '1xx': 'Informacional',
      '2xx': 'Sucesso',
      '3xx': 'Redirecionamento',
      '4xx': 'Erro do Cliente',
      '5xx': 'Erro do Servidor',
    },
    builtBy: 'Criado por',
  },
} as const

type Lang = keyof typeof translations
type Translation = (typeof translations)[Lang]

// ── Data ──────────────────────────────────────────────────────────────────────
interface StatusCode {
  code: number
  name: string
  description: { en: string; pt: string }
  usage: { en: string; pt: string }
  spec: string
}

const STATUS_CODES: StatusCode[] = [
  // 1xx Informational
  {
    code: 100,
    name: 'Continue',
    description: {
      en: 'The server has received the request headers and the client should proceed to send the request body. Used when a client needs to send a large payload and wants confirmation before doing so.',
      pt: 'O servidor recebeu os cabecalhos da requisicao e o cliente deve prosseguir enviando o corpo. Usado quando o cliente quer confirmacao antes de enviar um payload grande.',
    },
    usage: {
      en: 'Client sends a request with "Expect: 100-continue" header before uploading a large file. If the server responds with 100, the client proceeds; otherwise it aborts.',
      pt: 'O cliente envia uma requisicao com o cabecalho "Expect: 100-continue" antes de fazer upload de um arquivo grande. Se o servidor responde com 100, o cliente prossegue.',
    },
    spec: 'RFC 9110 §15.2.1',
  },
  {
    code: 101,
    name: 'Switching Protocols',
    description: {
      en: 'The server agrees to switch protocols as requested by the client via the Upgrade header. Commonly used to upgrade an HTTP connection to WebSocket.',
      pt: 'O servidor concorda em mudar o protocolo conforme solicitado pelo cliente via cabecalho Upgrade. Usado para atualizar conexoes HTTP para WebSocket.',
    },
    usage: {
      en: 'Client sends "Upgrade: websocket" and "Connection: Upgrade" headers. Server responds with 101, and the connection is upgraded to WebSocket from that point on.',
      pt: 'O cliente envia os cabecalhos "Upgrade: websocket" e "Connection: Upgrade". O servidor responde com 101 e a conexao passa a ser WebSocket.',
    },
    spec: 'RFC 9110 §15.2.2',
  },
  // 2xx Success
  {
    code: 200,
    name: 'OK',
    description: {
      en: 'The request succeeded. The meaning of success depends on the HTTP method: GET returns the resource, POST returns the result of the action, PUT/PATCH returns the updated resource, DELETE confirms deletion.',
      pt: 'A requisicao foi bem-sucedida. O significado de sucesso depende do metodo HTTP: GET retorna o recurso, POST retorna o resultado, PUT/PATCH retorna o recurso atualizado, DELETE confirma a exclusao.',
    },
    usage: {
      en: 'GET /users/123 returns the user object with HTTP 200. POST /login returns user session data with HTTP 200.',
      pt: 'GET /users/123 retorna o objeto do usuario com HTTP 200. POST /login retorna os dados de sessao com HTTP 200.',
    },
    spec: 'RFC 9110 §15.3.1',
  },
  {
    code: 201,
    name: 'Created',
    description: {
      en: 'The request succeeded and a new resource was created. The Location header typically points to the URL of the newly created resource.',
      pt: 'A requisicao foi bem-sucedida e um novo recurso foi criado. O cabecalho Location normalmente aponta para a URL do recurso recem-criado.',
    },
    usage: {
      en: 'POST /users creates a new user and returns 201 with a Location: /users/456 header and the created user object in the body.',
      pt: 'POST /users cria um novo usuario e retorna 201 com o cabecalho Location: /users/456 e o objeto criado no corpo da resposta.',
    },
    spec: 'RFC 9110 §15.3.2',
  },
  {
    code: 202,
    name: 'Accepted',
    description: {
      en: 'The request has been accepted for processing, but the processing has not been completed yet. Used for asynchronous operations where the server queues the work.',
      pt: 'A requisicao foi aceita para processamento, mas ainda nao foi concluida. Usado em operacoes assincronas onde o servidor enfileira o trabalho.',
    },
    usage: {
      en: 'POST /reports/generate returns 202 immediately while the report is generated in the background. The response body may include a job ID to poll for status.',
      pt: 'POST /reports/generate retorna 202 imediatamente enquanto o relatorio e gerado em segundo plano. O corpo pode incluir um ID de job para consultar o status.',
    },
    spec: 'RFC 9110 §15.3.3',
  },
  {
    code: 204,
    name: 'No Content',
    description: {
      en: 'The request succeeded but there is no content to return in the response body. The server fulfilled the request and there is nothing more to say.',
      pt: 'A requisicao foi bem-sucedida mas nao ha conteudo para retornar no corpo da resposta. O servidor cumpriu a requisicao e nao ha mais nada a dizer.',
    },
    usage: {
      en: 'DELETE /users/123 returns 204 with an empty body to confirm the user was deleted. PUT /settings returns 204 after successfully saving settings.',
      pt: 'DELETE /users/123 retorna 204 com corpo vazio confirmando que o usuario foi deletado. PUT /settings retorna 204 apos salvar as configuracoes com sucesso.',
    },
    spec: 'RFC 9110 §15.3.5',
  },
  // 3xx Redirection
  {
    code: 301,
    name: 'Moved Permanently',
    description: {
      en: 'The requested resource has been permanently moved to the URL given in the Location header. Browsers and crawlers should update their links. The method may change to GET on redirect.',
      pt: 'O recurso foi movido permanentemente para a URL indicada no cabecalho Location. Navegadores e crawlers devem atualizar seus links. O metodo pode mudar para GET no redirecionamento.',
    },
    usage: {
      en: 'GET /old-page returns 301 with Location: /new-page. Search engines transfer link equity to the new URL. Used for permanent URL changes and HTTP to HTTPS redirects.',
      pt: 'GET /old-page retorna 301 com Location: /new-page. Mecanismos de busca transferem a autoridade do link para a nova URL. Usado para mudancas permanentes de URL.',
    },
    spec: 'RFC 9110 §15.4.2',
  },
  {
    code: 302,
    name: 'Found',
    description: {
      en: 'The requested resource temporarily resides at a different URI. The client should continue using the original URI for future requests. The method may change to GET on redirect.',
      pt: 'O recurso solicitado esta temporariamente em outra URI. O cliente deve continuar usando a URI original para futuras requisicoes. O metodo pode mudar para GET.',
    },
    usage: {
      en: 'POST /login redirects to /dashboard with 302 after successful authentication. Used for Post/Redirect/Get pattern to prevent form resubmission.',
      pt: 'POST /login redireciona para /dashboard com 302 apos autenticacao bem-sucedida. Usado no padrao Post/Redirect/Get para evitar reenvio de formularios.',
    },
    spec: 'RFC 9110 §15.4.3',
  },
  {
    code: 304,
    name: 'Not Modified',
    description: {
      en: 'The resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. The client can use its cached version.',
      pt: 'O recurso nao foi modificado desde a versao especificada pelos cabecalhos If-Modified-Since ou If-None-Match. O cliente pode usar a versao em cache.',
    },
    usage: {
      en: 'GET /logo.png with "If-None-Match: abc123" returns 304 with no body if the file has not changed. The browser uses its cached copy, saving bandwidth.',
      pt: 'GET /logo.png com "If-None-Match: abc123" retorna 304 sem corpo se o arquivo nao mudou. O navegador usa a copia em cache, economizando banda.',
    },
    spec: 'RFC 9110 §15.4.5',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    description: {
      en: 'The resource temporarily resides at another URI. Unlike 302, the client must not change the HTTP method when following the redirect. POST stays POST, DELETE stays DELETE.',
      pt: 'O recurso esta temporariamente em outra URI. Diferente do 302, o cliente nao deve mudar o metodo HTTP ao seguir o redirecionamento. POST continua POST, DELETE continua DELETE.',
    },
    usage: {
      en: 'POST /upload returns 307 pointing to a regional endpoint. The client must repeat the POST to the new location without changing it to a GET.',
      pt: 'POST /upload retorna 307 apontando para um endpoint regional. O cliente deve repetir o POST para o novo local sem mudar para GET.',
    },
    spec: 'RFC 9110 §15.4.8',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    description: {
      en: 'The resource has been permanently moved to another URI, and the HTTP method must not change. It is the method-preserving equivalent of 301.',
      pt: 'O recurso foi movido permanentemente para outra URI e o metodo HTTP nao deve mudar. E o equivalente do 301 que preserva o metodo.',
    },
    usage: {
      en: 'POST /api/v1/users returns 308 with Location: /api/v2/users. Clients must update their bookmarks and repost to the new URI.',
      pt: 'POST /api/v1/users retorna 308 com Location: /api/v2/users. Os clientes devem atualizar seus favoritos e reenviar o POST para a nova URI.',
    },
    spec: 'RFC 9110 §15.4.9',
  },
  // 4xx Client Error
  {
    code: 400,
    name: 'Bad Request',
    description: {
      en: 'The server cannot process the request due to a client error such as malformed syntax, invalid request message framing, or deceptive request routing.',
      pt: 'O servidor nao pode processar a requisicao devido a um erro do cliente, como sintaxe malformada, enquadramento de mensagem invalido ou roteamento enganoso.',
    },
    usage: {
      en: 'POST /users with invalid JSON body returns 400. POST /search with a missing required "q" query parameter also returns 400 with a descriptive error message.',
      pt: 'POST /users com um corpo JSON invalido retorna 400. POST /search sem o parametro obrigatorio "q" tambem retorna 400 com uma mensagem de erro descritiva.',
    },
    spec: 'RFC 9110 §15.5.1',
  },
  {
    code: 401,
    name: 'Unauthorized',
    description: {
      en: 'The request lacks valid authentication credentials. Despite the name, it means "unauthenticated". The response must include a WWW-Authenticate header indicating the authentication scheme.',
      pt: 'A requisicao nao possui credenciais de autenticacao validas. Apesar do nome, significa "nao autenticado". A resposta deve incluir o cabecalho WWW-Authenticate.',
    },
    usage: {
      en: 'GET /api/profile without or with an expired JWT token returns 401 with WWW-Authenticate: Bearer. The client should re-authenticate and retry.',
      pt: 'GET /api/profile sem token JWT ou com token expirado retorna 401 com WWW-Authenticate: Bearer. O cliente deve se re-autenticar e tentar novamente.',
    },
    spec: 'RFC 9110 §15.5.2',
  },
  {
    code: 403,
    name: 'Forbidden',
    description: {
      en: 'The server understands the request but refuses to authorize it. The client is authenticated but does not have permission to access the resource. Unlike 401, re-authenticating will not help.',
      pt: 'O servidor entende a requisicao, mas recusa a autorizacao. O cliente esta autenticado, mas nao tem permissao para acessar o recurso. Diferente do 401, re-autenticar nao vai ajudar.',
    },
    usage: {
      en: 'GET /admin/dashboard by a regular authenticated user returns 403. DELETE /users/1 by a non-admin returns 403 because the role lacks the required permission.',
      pt: 'GET /admin/dashboard por um usuario comum autenticado retorna 403. DELETE /users/1 por um nao-admin retorna 403 pois o perfil nao tem a permissao necessaria.',
    },
    spec: 'RFC 9110 §15.5.4',
  },
  {
    code: 404,
    name: 'Not Found',
    description: {
      en: 'The server cannot find the requested resource. The URL is not recognized or the resource does not exist. Also used to hide the existence of resources for security reasons.',
      pt: 'O servidor nao encontrou o recurso solicitado. A URL nao e reconhecida ou o recurso nao existe. Tambem usado para ocultar a existencia de recursos por razoes de seguranca.',
    },
    usage: {
      en: 'GET /users/999 when user 999 does not exist returns 404. APIs may also return 404 instead of 403 to prevent exposing which resources exist.',
      pt: 'GET /users/999 quando o usuario 999 nao existe retorna 404. APIs podem retornar 404 em vez de 403 para nao revelar quais recursos existem.',
    },
    spec: 'RFC 9110 §15.5.5',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    description: {
      en: 'The HTTP method used is known by the server but is not supported for the target resource. The response must include an Allow header listing supported methods.',
      pt: 'O metodo HTTP usado e conhecido pelo servidor mas nao e suportado para o recurso alvo. A resposta deve incluir o cabecalho Allow listando os metodos suportados.',
    },
    usage: {
      en: 'DELETE /users returns 405 with "Allow: GET, POST" if the endpoint only supports listing and creating users, not bulk deletion.',
      pt: 'DELETE /users retorna 405 com "Allow: GET, POST" se o endpoint so suporta listar e criar usuarios, nao exclusao em massa.',
    },
    spec: 'RFC 9110 §15.5.6',
  },
  {
    code: 408,
    name: 'Request Timeout',
    description: {
      en: 'The server timed out waiting for the request. The client did not produce a complete request within the time the server was prepared to wait.',
      pt: 'O servidor esgotou o tempo esperando pela requisicao. O cliente nao produziu uma requisicao completa dentro do tempo que o servidor estava preparado para aguardar.',
    },
    usage: {
      en: 'A slow client uploading a large file takes too long and the server returns 408. The client may retry the request. The server can close the connection after sending this.',
      pt: 'Um cliente lento fazendo upload de um arquivo grande demora demais e o servidor retorna 408. O cliente pode tentar novamente. O servidor pode fechar a conexao apos enviar isso.',
    },
    spec: 'RFC 9110 §15.5.9',
  },
  {
    code: 409,
    name: 'Conflict',
    description: {
      en: 'The request conflicts with the current state of the target resource. Commonly used when a resource already exists or when there are concurrent modification conflicts.',
      pt: 'A requisicao entra em conflito com o estado atual do recurso alvo. Comumente usado quando o recurso ja existe ou quando ha conflitos de modificacao concorrente.',
    },
    usage: {
      en: 'POST /users with an email that already exists returns 409. PUT /document when an optimistic lock version does not match the current version also returns 409.',
      pt: 'POST /users com um email que ja existe retorna 409. PUT /document quando a versao do lock otimista nao corresponde a versao atual tambem retorna 409.',
    },
    spec: 'RFC 9110 §15.5.10',
  },
  {
    code: 413,
    name: 'Content Too Large',
    description: {
      en: 'The request body is larger than the limits defined by the server. The server may close the connection or return a Retry-After header if the condition is temporary.',
      pt: 'O corpo da requisicao e maior do que os limites definidos pelo servidor. O servidor pode fechar a conexao ou retornar o cabecalho Retry-After se a condicao for temporaria.',
    },
    usage: {
      en: 'POST /upload with a 100MB file when the server allows max 10MB returns 413. Nginx returns this by default when client_max_body_size is exceeded.',
      pt: 'POST /upload com um arquivo de 100MB quando o servidor permite no maximo 10MB retorna 413. O Nginx retorna isso por padrao quando client_max_body_size e excedido.',
    },
    spec: 'RFC 9110 §15.5.14',
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    description: {
      en: 'The server refuses to accept the request because the payload format is not supported. The client should send data in a format accepted by the server (check the Accept header).',
      pt: 'O servidor recusa a requisicao porque o formato do payload nao e suportado. O cliente deve enviar dados em um formato aceito pelo servidor (verificar o cabecalho Accept).',
    },
    usage: {
      en: 'POST /api/data with Content-Type: text/plain when the server only accepts application/json returns 415. Fix by setting the correct Content-Type header.',
      pt: 'POST /api/data com Content-Type: text/plain quando o servidor aceita apenas application/json retorna 415. Corrija definindo o cabecalho Content-Type correto.',
    },
    spec: 'RFC 9110 §15.5.16',
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    description: {
      en: 'The server understands the content type and syntax of the request but was unable to process the contained instructions. Common for validation errors in REST APIs.',
      pt: 'O servidor entende o tipo de conteudo e a sintaxe da requisicao, mas nao consegue processar as instrucoes contidas. Comum para erros de validacao em APIs REST.',
    },
    usage: {
      en: 'POST /users with valid JSON but invalid data (e.g., age: -5) returns 422 with a body listing field-level validation errors like {"errors": {"age": "must be positive"}}.',
      pt: 'POST /users com JSON valido mas dados invalidos (ex: age: -5) retorna 422 com um corpo listando erros de validacao por campo como {"errors": {"age": "deve ser positivo"}}.',
    },
    spec: 'RFC 9110 §15.5.21',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: {
      en: 'The user has sent too many requests in a given time window (rate limiting). The response may include a Retry-After header indicating how long to wait before making a new request.',
      pt: 'O usuario enviou muitas requisicoes em uma janela de tempo (rate limiting). A resposta pode incluir o cabecalho Retry-After indicando quanto tempo aguardar antes de tentar novamente.',
    },
    usage: {
      en: 'An API that allows 100 requests/minute returns 429 with "Retry-After: 60" and "X-RateLimit-Reset: 1720000000" after the limit is exceeded.',
      pt: 'Uma API que permite 100 requisicoes/minuto retorna 429 com "Retry-After: 60" e "X-RateLimit-Reset: 1720000000" apos exceder o limite.',
    },
    spec: 'RFC 6585 §4',
  },
  // 5xx Server Error
  {
    code: 500,
    name: 'Internal Server Error',
    description: {
      en: 'The server encountered an unexpected condition that prevented it from fulfilling the request. A generic catch-all error for unhandled server-side exceptions.',
      pt: 'O servidor encontrou uma condicao inesperada que impediu o atendimento da requisicao. Um erro generico para excecoes nao tratadas no servidor.',
    },
    usage: {
      en: 'An unhandled exception in the application code (e.g., NullPointerException, database query error) causes the server to return 500. Check server logs for the root cause.',
      pt: 'Uma excecao nao tratada no codigo da aplicacao (ex: NullPointerException, erro de consulta no banco) faz o servidor retornar 500. Verifique os logs do servidor.',
    },
    spec: 'RFC 9110 §15.6.1',
  },
  {
    code: 501,
    name: 'Not Implemented',
    description: {
      en: 'The server does not support the functionality required to fulfill the request. Used when the server does not recognize the request method or lacks the capability to fulfill it.',
      pt: 'O servidor nao suporta a funcionalidade necessaria para atender a requisicao. Usado quando o servidor nao reconhece o metodo ou nao tem capacidade de atender.',
    },
    usage: {
      en: 'PATCH /resource on a server that does not implement PATCH returns 501. Different from 405 (method not allowed for a resource) — 501 means not implemented globally.',
      pt: 'PATCH /resource em um servidor que nao implementa PATCH retorna 501. Diferente do 405 (metodo nao permitido para o recurso) — 501 significa nao implementado globalmente.',
    },
    spec: 'RFC 9110 §15.6.2',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    description: {
      en: 'The server, while acting as a gateway or proxy, received an invalid response from an upstream server. Indicates a problem in the chain between the client and the origin server.',
      pt: 'O servidor, atuando como gateway ou proxy, recebeu uma resposta invalida de um servidor upstream. Indica um problema na cadeia entre o cliente e o servidor de origem.',
    },
    usage: {
      en: 'Nginx returns 502 when the upstream Node.js application crashes or returns an invalid HTTP response. Check the upstream service health and logs.',
      pt: 'O Nginx retorna 502 quando a aplicacao Node.js upstream crasha ou retorna uma resposta HTTP invalida. Verifique a saude e os logs do servico upstream.',
    },
    spec: 'RFC 9110 §15.6.3',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description: {
      en: 'The server is not ready to handle the request. Common causes are the server is down for maintenance or is overloaded. A Retry-After header may indicate recovery time.',
      pt: 'O servidor nao esta pronto para lidar com a requisicao. Causas comuns sao manutencao ou sobrecarga do servidor. O cabecalho Retry-After pode indicar o tempo de recuperacao.',
    },
    usage: {
      en: 'During a deployment or a Kubernetes pod rolling update, the load balancer returns 503 until new pods are healthy. Also returned when connection pool is exhausted.',
      pt: 'Durante um deploy ou rolling update de pods no Kubernetes, o load balancer retorna 503 ate que os novos pods estejam saudaveis. Tambem retornado quando o pool de conexoes esta esgotado.',
    },
    spec: 'RFC 9110 §15.6.4',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    description: {
      en: 'The server, acting as a gateway or proxy, did not receive a timely response from an upstream server. Similar to 502 but specifically for timeout conditions.',
      pt: 'O servidor, atuando como gateway ou proxy, nao recebeu uma resposta em tempo habil de um servidor upstream. Similar ao 502, mas especificamente para condicoes de timeout.',
    },
    usage: {
      en: 'Nginx returns 504 when the backend application takes longer than proxy_read_timeout to respond. Common during heavy database queries or slow third-party API calls.',
      pt: 'O Nginx retorna 504 quando a aplicacao backend demora mais que proxy_read_timeout para responder. Comum durante consultas pesadas no banco ou chamadas lentas a APIs de terceiros.',
    },
    spec: 'RFC 9110 §15.6.5',
  },
]

type Category = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

const CATEGORIES: { key: Category; range: [number, number] }[] = [
  { key: '1xx', range: [100, 199] },
  { key: '2xx', range: [200, 299] },
  { key: '3xx', range: [300, 399] },
  { key: '4xx', range: [400, 499] },
  { key: '5xx', range: [500, 599] },
]

const CATEGORY_COLORS: Record<Category, { badge: string; border: string; header: string; dot: string }> = {
  '1xx': {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-blue-50 dark:bg-blue-950/40',
    dot: 'bg-blue-500',
  },
  '2xx': {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    header: 'bg-green-50 dark:bg-green-950/40',
    dot: 'bg-green-500',
  },
  '3xx': {
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    header: 'bg-yellow-50 dark:bg-yellow-950/40',
    dot: 'bg-yellow-500',
  },
  '4xx': {
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    header: 'bg-orange-50 dark:bg-orange-950/40',
    dot: 'bg-orange-500',
  },
  '5xx': {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    header: 'bg-red-50 dark:bg-red-950/40',
    dot: 'bg-red-500',
  },
}

function getCategoryForCode(code: number): Category {
  for (const cat of CATEGORIES) {
    if (code >= cat.range[0] && code <= cat.range[1]) return cat.key
  }
  return '5xx'
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CopyButton({ code, label, copiedLabel }: { code: number; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(String(code)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? copiedLabel : label}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400 shrink-0"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      <span className="hidden sm:inline">{copied ? copiedLabel : label}</span>
    </button>
  )
}

function StatusCard({
  status,
  lang,
  t,
  expanded,
  onToggle,
}: {
  status: StatusCode
  lang: Lang
  t: Translation
  expanded: boolean
  onToggle: () => void
}) {
  const cat = getCategoryForCode(status.code)
  const colors = CATEGORY_COLORS[cat]

  return (
    <div className={`rounded-xl border ${colors.border} bg-white dark:bg-zinc-900 overflow-hidden transition-shadow hover:shadow-sm`}>
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
        aria-expanded={expanded}
      >
        <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
        <span className={`font-mono font-bold text-lg tabular-nums px-2.5 py-0.5 rounded-lg ${colors.badge}`}>
          {status.code}
        </span>
        <span className="font-semibold text-sm flex-1 text-left">{status.name}</span>
        <CopyButton code={status.code} label={t.copy} copiedLabel={t.copied} />
        <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div className={`px-5 pb-5 border-t ${colors.border} pt-4 space-y-4`}>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {status.description[lang]}
          </p>

          <div className={`rounded-lg border ${colors.border} ${colors.header} px-4 py-3 space-y-1`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t.usage}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {status.usage[lang]}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t.spec}:</span>
            <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">{status.spec}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HttpStatus() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const t = translations[lang]

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return STATUS_CODES
    return STATUS_CODES.filter(
      s =>
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.en.toLowerCase().includes(q) ||
        s.description.pt.toLowerCase().includes(q),
    )
  }, [query])

  const groupedFiltered = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      items: filtered.filter(s => getCategoryForCode(s.code) === cat.key),
    })).filter(cat => cat.items.length > 0)
  }, [filtered])

  const allCodes = filtered.map(s => s.code)
  const allExpanded = allCodes.every(c => expanded.has(c))

  function toggleAll() {
    if (allExpanded) {
      setExpanded(prev => {
        const next = new Set(prev)
        allCodes.forEach(c => next.delete(c))
        return next
      })
    } else {
      setExpanded(prev => new Set([...prev, ...allCodes]))
    }
  }

  function toggleCard(code: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 sticky top-0 z-10 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs leading-none">HTTP</span>
            </div>
            <span className="font-semibold hidden sm:inline">HTTP Status</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => (l === 'en' ? 'pt' : 'en'))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle language"
            >
              <Languages size={14} />
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href="https://github.com/gmowses/http-status"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero */}
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Search + controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            {filtered.length > 0 && (
              <button
                onClick={toggleAll}
                className="shrink-0 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {allExpanded ? t.collapseAll : t.expandAll}
              </button>
            )}
          </div>

          {/* Category legend */}
          {!query && (
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <span
                  key={cat.key}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[cat.key].badge} ${CATEGORY_COLORS[cat.key].border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[cat.key].dot}`} />
                  {cat.key} {t.categories[cat.key]}
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-zinc-500 dark:text-zinc-400">{t.noResults}</p>
              <button
                onClick={() => setQuery('')}
                className="text-sm text-indigo-500 hover:underline"
              >
                {t.clearSearch}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedFiltered.map(cat => (
                <section key={cat.key}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[cat.key].badge} ${CATEGORY_COLORS[cat.key].border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[cat.key].dot}`} />
                      {cat.key}
                    </span>
                    <h2 className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {t.categories[cat.key]}
                    </h2>
                    <span className="text-xs text-zinc-400">({cat.items.length})</span>
                  </div>
                  <div className="space-y-3">
                    {cat.items.map(status => (
                      <StatusCard
                        key={status.code}
                        status={status}
                        lang={lang}
                        t={t}
                        expanded={expanded.has(status.code)}
                        onToggle={() => toggleCard(status.code)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>
            {t.builtBy}{' '}
            <a
              href="https://github.com/gmowses"
              className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 transition-colors"
            >
              Gabriel Mowses
            </a>
          </span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
