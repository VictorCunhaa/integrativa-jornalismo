"""Popula o banco com dados de demonstração completos para a plataforma Redação-Escola Digital."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, text, delete

from app.config import settings
from app.models.user import User, Interest, AccountType, user_interests
from app.models.editoria import Editoria
from app.models.post import Post, PostFormat, PostVisibility
from app.models.post_media import PostMedia, MediaType
from app.models.comment import Comment
from app.models.post_like import PostLike
from app.models.group import Group, GroupMember, GroupMemberRole, Challenge, ChallengeSubmission
from app.models.notification import Notification, NotificationType
from app.security import hash_password

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# ---------------------------------------------------------------------------
# Dados de referência
# ---------------------------------------------------------------------------

INTERESTS = [
    ("politica", "Política"),
    ("esportes", "Esportes"),
    ("cultura", "Cultura"),
    ("economia", "Economia"),
    ("ciencia", "Ciência"),
    ("tecnologia", "Tecnologia"),
    ("internacional", "Internacional"),
    ("cotidiano", "Cotidiano"),
    ("meio-ambiente", "Meio Ambiente"),
    ("direitos-humanos", "Direitos Humanos"),
]

EDITORIAS = INTERESTS  # mesmo conjunto

# ---------------------------------------------------------------------------
# Usuários  (email, username, display_name, account_type, bio, avatar, cover)
# ---------------------------------------------------------------------------

USERS_DATA = [
    # --- students ---
    (
        "ana.silva@demo.br", "ana_silva", "Ana Silva", AccountType.student,
        "Estudante de jornalismo na UNIPLAC. Apaixonada por jornalismo investigativo e direitos humanos. "
        "Estagiária na rádio universitária e produtora do podcast 'Pauta Aberta'.",
        "/uploads/foto_mulher1.jpg", "/uploads/banner-1.jpg",
        ["politica", "direitos-humanos", "cultura"],
    ),
    (
        "lucas.oliveira@demo.br", "lucas_oliveira", "Lucas Oliveira", AccountType.student,
        "Estudante do 3º ano de jornalismo. Focado em jornalismo de dados e visualização. "
        "Colaborador do jornal-laboratório da universidade e entusiasta de código aberto.",
        "/uploads/foto_homem1.jpg", "/uploads/banner-2.jpg",
        ["tecnologia", "esportes", "economia"],
    ),
    # --- professors ---
    (
        "carlos.mendes@demo.br", "prof_carlos", "Prof. Carlos Mendes", AccountType.professor,
        "Doutor em Comunicação pela USP. Professor de Jornalismo Investigativo e Ética na Mídia há 15 anos. "
        "Pesquisador do Núcleo de Estudos em Jornalismo Digital e colunista eventual em veículos regionais.",
        "/uploads/foto_homem2.jpg", "/uploads/banner-3.jpg",
        ["politica", "direitos-humanos", "internacional"],
    ),
    (
        "fernanda.reis@demo.br", "prof_fernanda", "Profa. Fernanda Reis", AccountType.professor,
        "Mestre em Jornalismo pela PUC-SP. Especialista em radiojornalismo e novas narrativas sonoras. "
        "Coordenadora do laboratório de rádio da UNIPLAC e consultora de podcasts educativos.",
        "/uploads/foto_mulher1.jpg", "/uploads/banner-4.jpg",
        ["cultura", "cotidiano", "meio-ambiente"],
    ),
    # --- professionals ---
    (
        "maria.jornalista@demo.br", "maria_jornalista", "Maria Jornalista", AccountType.professional,
        "Repórter com 10 anos de experiência em coberturas de política e economia. "
        "Passou por veículos como Folha, Agência Brasil e atualmente contribui com portais independentes. "
        "Especialista em fact-checking e verificação de fontes.",
        "/uploads/foto_mulher1.jpg", "/uploads/banner-1.jpg",
        ["politica", "economia", "internacional"],
    ),
    (
        "rafael.fotojornalista@demo.br", "rafael_foto", "Rafael Fotojornalista", AccountType.professional,
        "Fotojornalista freelancer com cobertura de conflitos urbanos, manifestações e cultura popular. "
        "Exposições realizadas em São Paulo, Curitiba e Buenos Aires. "
        "Trabalha com fotografia documental e ensaios para ONGs.",
        "/uploads/foto_homem1.jpg", "/uploads/banner-2.jpg",
        ["cultura", "direitos-humanos", "cotidiano"],
    ),
    # --- alumni ---
    (
        "joao.egresso@demo.br", "joao_egresso", "João Egresso", AccountType.alumni,
        "Egresso da turma de 2019. Hoje editor de conteúdo digital em agência de comunicação corporativa. "
        "Mantém blog pessoal sobre jornalismo e tecnologia e é mentor de alunos da graduação.",
        "/uploads/foto_homem2.jpg", "/uploads/banner-3.jpg",
        ["tecnologia", "economia", "cotidiano"],
    ),
    (
        "patricia.alumni@demo.br", "patricia_alumni", "Patrícia Santana", AccountType.alumni,
        "Formada em 2021, atua como correspondente regional para agências de notícias. "
        "Cobertura especializada em meio ambiente e políticas públicas no Sul do Brasil. "
        "Autora de dois livros-reportagem sobre comunidades ribeirinhas.",
        "/uploads/foto_mulher1.jpg", "/uploads/banner-4.jpg",
        ["meio-ambiente", "direitos-humanos", "politica"],
    ),
]

# ---------------------------------------------------------------------------
# Posts  (título, subtítulo, editoria_slug, formato, visibilidade, cover, content_html, user_idx, dias_atrás)
# ---------------------------------------------------------------------------

now = datetime.now(timezone.utc)

def _dt(days_ago: int) -> datetime:
    return now - timedelta(days=days_ago)


POSTS_DATA = [
    # --- politica (3 posts) ---
    {
        "title": "O que muda com a nova lei de proteção de dados para jornalistas",
        "subtitle": "Especialistas debatem impactos da regulamentação no cotidiano das redações",
        "editoria": "politica", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/lei_protecao_dados.jfif", "user_idx": 4, "days_ago": 30,
        "html": (
            "<p>A aprovação da nova regulamentação de proteção de dados trouxe questionamentos importantes "
            "para o exercício do jornalismo no Brasil.</p>"
            "<p>Fontes ouvidas pela reportagem apontam que a lei exige adaptações nas rotinas de coleta "
            "e armazenamento de informações de fontes sensíveis.</p>"
            "<blockquote><p>\"O jornalismo investigativo precisa de clareza sobre o que pode ou não ser "
            "guardado\", afirma especialista em direito digital.</p></blockquote>"
            "<p>A discussão está longe de terminar, e as redações já começam a rever seus protocolos "
            "internos de segurança da informação.</p>"
        ),
    },
    {
        "title": "Polarização política e desinformação: os desafios das eleições municipais",
        "subtitle": "Pesquisa mapeia narrativas falsas que circularam no WhatsApp durante a campanha",
        "editoria": "politica", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/lei_protecao_dados.jfif", "user_idx": 2, "days_ago": 20,
        "html": (
            "<p>As eleições municipais de 2024 registraram um volume recorde de desinformação circulando "
            "em aplicativos de mensagens, segundo levantamento de pesquisadores da Unicamp.</p>"
            "<h2>O papel das plataformas</h2>"
            "<p>WhatsApp, Telegram e grupos fechados no Facebook foram os principais vetores de conteúdo "
            "falso, dificultando o trabalho de agências de fact-checking.</p>"
            "<p>A pesquisa identificou mais de 3.000 peças de desinformação distintas, sendo 40% delas "
            "criadas nas 48 horas anteriores à votação.</p>"
        ),
    },
    {
        "title": "Rascunho: análise das pesquisas de intenção de voto — trabalho em andamento",
        "subtitle": None,
        "editoria": "politica", "format": PostFormat.text, "visibility": PostVisibility.private,
        "cover": None, "user_idx": 0, "days_ago": 0,
        "html": "<p>Notas preliminares para análise — não publicar ainda.</p>",
    },
    # --- esportes (2 posts) ---
    {
        "title": "Cobertura esportiva: como os dados mudaram o futebol brasileiro",
        "subtitle": "Data journalism transforma análise de desempenho nas equipes da Série A",
        "editoria": "esportes", "format": PostFormat.photo, "visibility": PostVisibility.public,
        "cover": "/uploads/cobertura_esportiva.jpg", "user_idx": 1, "days_ago": 25,
        "html": (
            "<h2>A revolução dos dados</h2>"
            "<p>O futebol brasileiro vive uma transformação silenciosa: clubes da Série A investiram "
            "em analistas de dados para guiar contratações e táticas de jogo.</p>"
            "<p>Com softwares de rastreamento e inteligência artificial, times menores conseguem "
            "competir com orçamentos maiores ao identificar talentos subvalorizados.</p>"
            "<figure><img src=\"/uploads/cobertura_esportiva.jpg\"/>"
            "<figcaption>Estádio durante jogo da Série A — Foto: Rafael Fotojornalista</figcaption></figure>"
            "<p>A reportagem visitou três clubes que adotaram essa filosofia e conversou com os "
            "profissionais por trás da mudança.</p>"
        ),
    },
    {
        "title": "Atletas olímpicos brasileiros e a cobertura midiática: representatividade em pauta",
        "subtitle": "Estudo analisa como a imprensa retrata atletas negros e mulheres nas Olimpíadas",
        "editoria": "esportes", "format": PostFormat.text, "visibility": PostVisibility.restricted,
        "cover": "/uploads/cobertura_esportiva.jpg", "user_idx": 5, "days_ago": 15,
        "html": (
            "<p>Uma pesquisa da Fundação Getúlio Vargas analisou mais de 5.000 matérias publicadas "
            "durante os Jogos Olímpicos de Paris 2024 e concluiu que atletas negros recebem 30% menos "
            "cobertura nas páginas principais de grandes portais esportivos.</p>"
            "<p>O estudo também identificou diferenças na linguagem utilizada para descrever conquistas "
            "de atletas mulheres em comparação com homens.</p>"
        ),
    },
    # --- cultura (2 posts) ---
    {
        "title": "Festival de Cinema de Tiradentes: o que esperar da edição deste ano",
        "subtitle": "Programação inclui retrospectiva de diretoras brasileiras e debates sobre financiamento",
        "editoria": "cultura", "format": PostFormat.photo, "visibility": PostVisibility.public,
        "cover": "/uploads/festival.jpeg", "user_idx": 5, "days_ago": 18,
        "html": (
            "<p>O Festival de Cinema de Tiradentes chega à sua nova edição com uma programação que "
            "celebra o cinema independente nacional.</p>"
            "<p>A curadoria deste ano priorizou obras de realizadoras mulheres, com uma mostra especial "
            "que reúne filmes das décadas de 1970 a 2020.</p>"
            "<figure><img src=\"/uploads/festival.jpeg\"/>"
            "<figcaption>Cerimônia de abertura do festival — Foto: arquivo/organização</figcaption></figure>"
            "<p>Entre os destaques, um debate inédito sobre o modelo de financiamento de filmes "
            "brasileiros e os desafios pós-pandemia para salas de cinema.</p>"
        ),
    },
    {
        "title": "Literatura periférica ganha espaço nas grandes editoras brasileiras",
        "subtitle": "Autores de favelas e periferias conquistam contratos e prêmios literários nacionais",
        "editoria": "cultura", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/jovens_mercado.jpeg", "user_idx": 6, "days_ago": 10,
        "html": (
            "<p>Após anos à margem da indústria editorial tradicional, escritores das periferias "
            "brasileiras conquistam contratos com grandes editoras e disputam prêmios literários "
            "de prestígio nacional.</p>"
            "<p>O movimento, impulsionado por coletivos culturais e redes sociais, transformou a "
            "percepção do mercado editorial sobre o potencial comercial dessas obras.</p>"
            "<blockquote><p>\"A periferia sempre teve histórias para contar. O que mudou foi o acesso "
            "aos canais de distribuição\", afirma uma das autoras premiadas.</p></blockquote>"
        ),
    },
    # --- economia (3 posts) ---
    {
        "title": "Inflação e aluguel: como famílias de baixa renda se adaptam em São Paulo",
        "subtitle": "Reportagem ouve moradores de cortiços e movimentos de luta por moradia",
        "editoria": "economia", "format": PostFormat.mixed, "visibility": PostVisibility.public,
        "cover": "/uploads/inflacao.jpg", "user_idx": 4, "days_ago": 22,
        "html": (
            "<p>Com o aluguel em alta na capital paulista, famílias de baixa renda relatam dificuldades "
            "crescentes para manter moradia digna.</p>"
            "<figure><img src=\"/uploads/inflacao.jpg\"/>"
            "<figcaption>Cortiço no centro de São Paulo — Foto: Rafael Fotojornalista</figcaption></figure>"
            "<p>A reportagem percorreu bairros centrais e registrou histórias de quem enfrenta "
            "diretamente a crise habitacional.</p>"
            "<p>\"Antes eu pagava R$ 800 por um quarto. Agora o mesmo quarto custa R$ 1.400\", conta "
            "uma costureira de 42 anos, moradora do bairro Brás.</p>"
        ),
    },
    {
        "title": "Cooperativas solidárias: modelo alternativo cresce no interior do Brasil",
        "subtitle": "Empreendimentos coletivos resistem à crise econômica e geram renda sustentável",
        "editoria": "economia", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/inflacao.jpg", "user_idx": 7, "days_ago": 12,
        "html": (
            "<p>Em cidades de médio porte do interior, cooperativas de trabalhadores rurais e artesãos "
            "apresentam crescimento contínuo mesmo em períodos de retração econômica.</p>"
            "<p>O modelo, que distribui resultados entre todos os associados, está atraindo atenção de "
            "economistas e formuladores de políticas públicas como alternativa ao desemprego.</p>"
        ),
    },
    {
        "title": "Análise restrita: projeções fiscais para 2025 — uso interno",
        "subtitle": None,
        "editoria": "economia", "format": PostFormat.text, "visibility": PostVisibility.restricted,
        "cover": None, "user_idx": 2, "days_ago": 3,
        "html": "<p>Análise de uso restrito para membros do grupo de estudos econômicos.</p>",
    },
    # --- ciencia (2 posts) ---
    {
        "title": "Pesquisadores da USP desenvolvem vacina contra dengue de baixo custo",
        "subtitle": "Tecnologia pode ser aplicada em países em desenvolvimento sem cadeia de frio",
        "editoria": "ciencia", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/usp_vacina.jpg", "user_idx": 1, "days_ago": 28,
        "html": (
            "<p>Um grupo de pesquisadores da Universidade de São Paulo anunciou avanços significativos "
            "no desenvolvimento de uma vacina contra dengue sem necessidade de refrigeração constante.</p>"
            "<p>A tecnologia, baseada em nanopartículas lipídicas, representa um passo importante para "
            "a democratização do imunizante em regiões com infraestrutura limitada.</p>"
            "<p>Os testes clínicos de fase 2 devem começar no próximo semestre, segundo os coordenadores "
            "do projeto financiado pelo CNPq.</p>"
        ),
    },
    {
        "title": "Inteligência artificial no diagnóstico médico: avanços e limites éticos",
        "subtitle": "Sistemas de IA detectam câncer de pele com precisão superior a dermatologistas em testes",
        "editoria": "ciencia", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/startup.png", "user_idx": 3, "days_ago": 8,
        "html": (
            "<p>Modelos de inteligência artificial desenvolvidos para diagnóstico de câncer de pele "
            "atingiram precisão de 94,5% em estudos clínicos controlados, superando a média de "
            "médicos especialistas (86,6%) nos mesmos conjuntos de imagens.</p>"
            "<p>A descoberta levanta debates éticos sobre o papel da IA na medicina, responsabilidade "
            "em casos de erro e o futuro da formação médica.</p>"
        ),
    },
    # --- tecnologia (2 posts) ---
    {
        "title": "Startups brasileiras de IA: entre o hype e a realidade",
        "subtitle": "Levantamento aponta que apenas 12% das empresas que se dizem 'de IA' usam a tecnologia como core",
        "editoria": "tecnologia", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/startup.png", "user_idx": 6, "days_ago": 14,
        "html": (
            "<p>O Brasil tem mais de 3.000 empresas que se autodenominam startups de inteligência "
            "artificial, mas pesquisa recente indica que apenas uma fração tem a tecnologia como "
            "componente central do negócio.</p>"
            "<p>Especialistas alertam que o fenômeno do 'AI washing' prejudica o ecossistema ao "
            "distorcer o mercado de investimentos.</p>"
            "<blockquote><p>\"Investidores estão cada vez mais criteriosos. O rótulo não basta; "
            "pedem métricas de uso real da tecnologia\", diz analista do setor.</p></blockquote>"
        ),
    },
    {
        "title": "Open source no jornalismo: ferramentas gratuitas que transformam redações",
        "subtitle": "Da extração de dados à visualização: conheça o arsenal do jornalista de dados moderno",
        "editoria": "tecnologia", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/startup.png", "user_idx": 1, "days_ago": 6,
        "html": (
            "<p>Redações ao redor do mundo estão incorporando ferramentas de código aberto para "
            "coletar, processar e visualizar dados de interesse público, sem custo de licenciamento.</p>"
            "<h2>Principais ferramentas</h2>"
            "<ul><li><strong>Python + pandas</strong>: análise de datasets</li>"
            "<li><strong>QGIS</strong>: mapas e georreferenciamento</li>"
            "<li><strong>Gephi</strong>: análise de redes</li>"
            "<li><strong>Flourish</strong>: gráficos interativos</li></ul>"
        ),
    },
    # --- internacional (2 posts) ---
    {
        "title": "Jornalismo de guerra: cobertura do conflito no Oriente Médio em perspectiva",
        "subtitle": "Correspondentes brasileiros relatam desafios e dilemas éticos da cobertura em zonas de conflito",
        "editoria": "internacional", "format": PostFormat.video, "visibility": PostVisibility.public,
        "cover": "/uploads/cop30.jfif", "user_idx": 4, "days_ago": 17,
        "html": (
            "<p>Dois correspondentes brasileiros que cobriram o conflito no Oriente Médio compartilham "
            "suas experiências em formato de vídeo-entrevista, discutindo segurança, acesso a fontes "
            "e os limites éticos da cobertura em zonas de guerra.</p>"
            "<p><em>Conteúdo com depoimentos em vídeo. Assista ao player abaixo.</em></p>"
        ),
    },
    {
        "title": "Refugiados e imprensa: como a mídia retrata as crises migratórias",
        "subtitle": "Análise de cobertura em 12 países mostra padrões de desumanização nas narrativas",
        "editoria": "internacional", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/cop30.jfif", "user_idx": 2, "days_ago": 9,
        "html": (
            "<p>Uma pesquisa internacional que analisou a cobertura de crises migratórias em 12 países "
            "identificou padrões recorrentes de desumanização na linguagem utilizada por grandes veículos "
            "de comunicação ao tratar de refugiados.</p>"
            "<p>Termos como 'horda', 'invasão' e 'onda' aparecem com frequência desproporcional mesmo "
            "em veículos considerados de referência, segundo o levantamento.</p>"
        ),
    },
    # --- cotidiano (2 posts) ---
    {
        "title": "Jovens jornalistas e o mercado: reinventando a profissão",
        "subtitle": "Alunos de jornalismo falam sobre expectativas, desafios e novos modelos de trabalho",
        "editoria": "cotidiano", "format": PostFormat.mixed, "visibility": PostVisibility.public,
        "cover": "/uploads/jovens_mercado.jpeg", "user_idx": 0, "days_ago": 35,
        "html": (
            "<p>A geração que está chegando ao mercado jornalístico carrega experiências únicas: "
            "cresceram com a internet, viveram a queda dos classificados e a ascensão das newsletters "
            "independentes.</p>"
            "<figure><img src=\"/uploads/jovens_mercado.jpeg\"/>"
            "<figcaption>Estudantes durante atividade prática — Foto: acervo UNIPLAC</figcaption></figure>"
            "<p>Em entrevistas com estudantes de cinco universidades, a reportagem identificou um perfil "
            "em transformação: mais disposto ao empreendedorismo e ao jornalismo de dados.</p>"
            "<blockquote><p>\"Não espero trabalhar em um grande veículo por 30 anos. Quero criar o meu "
            "próprio espaço\", diz estudante do 4º ano em Salvador.</p></blockquote>"
        ),
    },
    {
        "title": "Saúde mental nas redações: o peso invisível da profissão",
        "subtitle": "Jornalistas relatam burnout, ansiedade e a cultura do silêncio sobre sofrimento mental",
        "editoria": "cotidiano", "format": PostFormat.audio, "visibility": PostVisibility.public,
        "cover": "/uploads/jovens_mercado.jpeg", "user_idx": 3, "days_ago": 5,
        "html": (
            "<p>Um episódio de podcast investigativo que mergulha na realidade da saúde mental entre "
            "jornalistas brasileiros. Oito profissionais de diferentes regiões e veículos compartilham "
            "suas histórias de forma anônima.</p>"
            "<p><em>Ouça o episódio completo no player acima.</em></p>"
        ),
    },
    # --- meio-ambiente (2 posts) ---
    {
        "title": "COP30 na Amazônia: o que está em jogo para o Brasil",
        "subtitle": "País recebe a conferência climática da ONU em meio a pressões ambientais históricas",
        "editoria": "meio-ambiente", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/cop30.jfif", "user_idx": 7, "days_ago": 32,
        "html": (
            "<p>A realização da COP30 no Brasil representa uma oportunidade histórica e uma enorme "
            "responsabilidade. O país que abriga a maior floresta tropical do mundo precisará mostrar "
            "ao mundo que suas políticas ambientais estão à altura do desafio.</p>"
            "<p>Especialistas consultados são unânimes: a credibilidade do Brasil nas negociações "
            "climáticas passa pelo desmatamento da Amazônia.</p>"
            "<p>Com metas ambiciosas anunciadas, o governo terá que traduzir compromissos em ações "
            "concretas até novembro de 2025.</p>"
        ),
    },
    {
        "title": "Jornalismo ambiental no Brasil: vozes da Amazônia na mídia independente",
        "subtitle": "Repórteres locais arriscam a vida para noticiar crimes ambientais no interior do país",
        "editoria": "meio-ambiente", "format": PostFormat.photo, "visibility": PostVisibility.public,
        "cover": "/uploads/cop30.jfif", "user_idx": 5, "days_ago": 11,
        "html": (
            "<p>Em municípios do Pará, Amazonas e Mato Grosso, jornalistas independentes documentam "
            "garimpo ilegal, grilagem de terra e violência contra povos originários, muitas vezes "
            "sob risco direto à sua segurança.</p>"
            "<figure><img src=\"/uploads/cop30.jfif\"/>"
            "<figcaption>Área de desmatamento no sul do Pará — Foto: Rafael Fotojornalista</figcaption></figure>"
            "<p>A reportagem conversa com quatro desses profissionais e traça o perfil do jornalismo "
            "ambiental independente no Brasil.</p>"
        ),
    },
    # --- direitos-humanos (2 posts) ---
    {
        "title": "Encarceramento feminino: o drama invisível das mães atrás das grades",
        "subtitle": "Brasil tem a terceira maior população carcerária feminina do mundo; filhos sofrem impactos profundos",
        "editoria": "direitos-humanos", "format": PostFormat.text, "visibility": PostVisibility.public,
        "cover": "/uploads/lei_protecao_dados.jfif", "user_idx": 7, "days_ago": 40,
        "html": (
            "<p>Com mais de 40.000 mulheres presas, o Brasil ocupa o terceiro lugar no ranking mundial "
            "de encarceramento feminino. Por trás dos números, histórias de mães separadas dos filhos, "
            "muitas vezes por crimes não violentos relacionados ao tráfico de drogas.</p>"
            "<p>A reportagem-documento acompanhou seis famílias ao longo de três meses e revela o "
            "impacto geracional do encarceramento feminino.</p>"
        ),
    },
    {
        "title": "Povos originários e a luta pela demarcação de terras no Sul",
        "subtitle": "Comunidades Guarani e Kaingang resistem a pressões do agronegócio em Santa Catarina",
        "editoria": "direitos-humanos", "format": PostFormat.photo, "visibility": PostVisibility.public,
        "cover": "/uploads/lei_protecao_dados.jfif", "user_idx": 3, "days_ago": 13,
        "html": (
            "<p>Enquanto o debate sobre demarcação de terras indígenas chega ao Congresso Nacional, "
            "comunidades Guarani e Kaingang no planalto catarinense vivem cotidianamente o conflito "
            "com produtores rurais que contestam a titulação das terras.</p>"
            "<figure><img src=\"/uploads/lei_protecao_dados.jfif\"/>"
            "<figcaption>Liderança Kaingang durante assembleia — Foto: acervo comunidade</figcaption></figure>"
            "<p>A reportagem visitou três comunidades e ouviu lideranças, advogados e representantes "
            "do agronegócio para construir um retrato equilibrado do conflito.</p>"
        ),
    },
]

# ---------------------------------------------------------------------------
# Comentários  (post_idx, user_idx, content)
# ---------------------------------------------------------------------------

COMMENTS_DATA = [
    (0, 1, "Reportagem fundamental! A LGPD precisa de uma regulamentação específica para redações jornalísticas."),
    (0, 6, "Concordo. Já vi casos de jornalistas processados por manter arquivos de fontes. Urge uma solução."),
    (0, 3, "Importante pontuar que a lei prevê exceções para fins jornalísticos. O problema é a insegurança jurídica."),
    (1, 0, "A polarização está destruindo o debate público. Precisamos de mais letramento midiático nas escolas."),
    (1, 5, "Excelente análise. O WhatsApp é um veículo que se recusa a ser regulado como veículo de comunicação."),
    (3, 0, "Finalmente! Dados no futebol brasileiro ainda são subvalorizados perto do que acontece na Europa."),
    (3, 4, "Trabalho com análise de dados e confirmo: as equipes que adotam esse modelo têm resultados superiores."),
    (3, 6, "Curioso saber como os próprios jogadores reagem à análise constante de desempenho."),
    (5, 1, "Festival incrível! A mostra de diretoras brasileiras é uma reparação histórica necessária."),
    (5, 0, "Alguém sabe se haverá transmissão online para quem não conseguir ir presencialmente?"),
    (7, 2, "Matéria chocante. A crise habitacional em SP é uma emergência que a mídia ainda cobre de forma insuficiente."),
    (7, 5, "Os dados de aluguel no centro de SP são ainda mais graves do que essa reportagem mostra."),
    (10, 1, "Vacina sem cadeia de frio seria revolucionária para o interior da Amazônia. Torço muito por esse projeto!"),
    (10, 7, "Importante acompanhar os resultados da fase 2. Temos bons pesquisadores no Brasil, mas falta financiamento."),
    (12, 0, "AI washing é um problema real. Já fiz matéria sobre isso e a dificuldade é que as empresas enrolam muito."),
    (12, 6, "O mercado vai se regular sozinho quando os investidores começarem a perder dinheiro com promessas vazias."),
    (14, 3, "Jornalismo de guerra é o mais difícil e o mais importante. Parabéns pela coragem da cobertura."),
    (16, 0, "Me identifico demais! A geração atual entende o jornalismo como serviço público, não como carreira estável."),
    (16, 6, "Já passei por tudo isso. Hoje trabalho em comunicação corporativa mas nunca deixei o jornalismo de lado."),
    (16, 3, "Ótimo ponto sobre empreendedorismo. Newsletters independentes salvaram muito jornalismo de qualidade."),
    (18, 4, "COP30 no Brasil é uma grande oportunidade. Mas precisamos de mais do que discurso, precisamos de ação."),
    (18, 2, "A credibilidade do Brasil no clima passa pelo que fazemos AGORA na Amazônia, não no que prometemos."),
    (17, 5, "Esse tema é muito importante. A saúde mental dos jornalistas é um assunto tabu na maioria das redações."),
    (17, 0, "Já precisei de afastamento por burnout. Obrigada por dar visibilidade a isso."),
    (20, 2, "Reportagem poderosa. O encarceramento feminino é uma das maiores injustiças invisíveis do Brasil."),
    (20, 3, "A questão das crianças separadas das mães presas deveria ser prioridade de políticas públicas."),
    (21, 0, "Fundamental dar voz às comunidades. A demarcação de terras é uma questão de vida ou morte para eles."),
    (21, 4, "Matéria equilibrada. Difícil encontrar cobertura que ouça todos os lados nesse tema tão polarizado."),
]

# ---------------------------------------------------------------------------
# Grupos
# ---------------------------------------------------------------------------

GROUPS_DATA = [
    {
        "name": "Laboratório de Jornalismo de Dados",
        "description": "Grupo de estudos e prática em jornalismo de dados, visualização e análise estatística. "
                       "Aberto a estudantes e profissionais interessados em aprender e compartilhar projetos.",
        "creator_idx": 2,  # prof_carlos
        "members_idx": [0, 1, 5, 6],  # ana, lucas, rafael, joao
    },
    {
        "name": "Redação Digital — Turma 2024",
        "description": "Grupo oficial da turma de Jornalismo Digital 2024. "
                       "Compartilhamento de pautas, desafios de reportagem e materiais didáticos.",
        "creator_idx": 3,  # prof_fernanda
        "members_idx": [0, 1, 4, 7],  # ana, lucas, maria, patricia
    },
    {
        "name": "Coberturas Especiais: Meio Ambiente e Direitos Humanos",
        "description": "Grupo interdisciplinar para desenvolvimento de grandes reportagens sobre "
                       "meio ambiente e direitos humanos. Colaboração entre estudantes, professores e alumni.",
        "creator_idx": 2,  # prof_carlos
        "members_idx": [0, 7, 3, 5, 6],  # ana, patricia, prof_fernanda, rafael, joao
    },
]

# ---------------------------------------------------------------------------
# Desafios  (group_idx, creator_idx, title, description_html, due_days_from_now)
# ---------------------------------------------------------------------------

CHALLENGES_DATA = [
    {
        "group_idx": 0,
        "creator_idx": 2,
        "title": "Reportagem com dados abertos: analise o orçamento municipal",
        "description_html": (
            "<p>Utilize dados abertos do Portal da Transparência do município de sua escolha para "
            "produzir uma reportagem jornalística sobre o orçamento público.</p>"
            "<h3>Requisitos</h3>"
            "<ul><li>Mínimo de 600 palavras</li>"
            "<li>Ao menos um gráfico ou visualização de dados</li>"
            "<li>Duas fontes identificadas (especialistas ou gestores)</li>"
            "<li>Metodologia de análise descrita no texto</li></ul>"
            "<p>Prazo: conforme indicado acima. Submeta como post na editoria Economia ou Política.</p>"
        ),
        "due_days": 14,
    },
    {
        "group_idx": 0,
        "creator_idx": 2,
        "title": "Fact-check: verifique uma afirmação política recente",
        "description_html": (
            "<p>Escolha uma afirmação de um agente político publicada nos últimos 30 dias e "
            "produza um fact-check completo seguindo a metodologia das principais agências.</p>"
            "<h3>Estrutura esperada</h3>"
            "<ul><li>Afirmação e contexto</li>"
            "<li>Fontes consultadas (mínimo 3)</li>"
            "<li>Veredicto fundamentado</li>"
            "<li>Conclusão com classificação: Verdadeiro / Falso / Parcialmente verdadeiro / Exagerado</li></ul>"
        ),
        "due_days": 7,
    },
    {
        "group_idx": 1,
        "creator_idx": 3,
        "title": "Produção de podcast: entreviste um profissional da área",
        "description_html": (
            "<p>Produza um episódio de podcast com duração entre 10 e 20 minutos entrevistando "
            "um profissional de comunicação da sua cidade.</p>"
            "<h3>Critérios de avaliação</h3>"
            "<ul><li>Qualidade técnica do áudio</li>"
            "<li>Roteiro e condução da entrevista</li>"
            "<li>Clareza e objetividade</li>"
            "<li>Edição e ritmo do episódio</li></ul>"
            "<p>Entregue o arquivo de áudio como post no formato 'audio' na editoria Cotidiano.</p>"
        ),
        "due_days": 21,
    },
    {
        "group_idx": 1,
        "creator_idx": 3,
        "title": "Cobertura fotográfica: um dia na vida de um trabalhador invisível",
        "description_html": (
            "<p>Produza um ensaio fotojornalístico acompanhando por pelo menos 4 horas um trabalhador "
            "de uma profissão pouco representada na mídia convencional.</p>"
            "<h3>Entrega</h3>"
            "<ul><li>Mínimo de 8 fotografias editadas</li>"
            "<li>Legendas com nome, função, cidade e crédito fotográfico</li>"
            "<li>Texto de contextualização (150–300 palavras)</li></ul>"
            "<p>Submeta como post no formato 'photo' na editoria de sua escolha.</p>"
        ),
        "due_days": 10,
    },
    {
        "group_idx": 2,
        "creator_idx": 2,
        "title": "Grande reportagem: impacto ambiental em sua comunidade",
        "description_html": (
            "<p>Produza uma reportagem de fôlego (mínimo 1.200 palavras) investigando um problema "
            "ambiental concreto na sua cidade ou região.</p>"
            "<h3>Exigências</h3>"
            "<ul><li>Mínimo de 4 fontes (cientistas, moradores, poder público, especialistas)</li>"
            "<li>Dados quantitativos para embasar a denúncia</li>"
            "<li>Fotos originais do local</li>"
            "<li>Direito de resposta concedido às partes acusadas</li></ul>"
        ),
        "due_days": 30,
    },
    {
        "group_idx": 2,
        "creator_idx": 3,
        "title": "Perfil humano: voz de quem tem direitos violados",
        "description_html": (
            "<p>Produza um perfil jornalístico de uma pessoa cujos direitos fundamentais foram "
            "violados e que normalmente não tem voz na mídia tradicional.</p>"
            "<h3>Formato</h3>"
            "<ul><li>Texto narrativo em primeira pessoa com intervenção do repórter</li>"
            "<li>Mínimo de 2 encontros presenciais com a fonte</li>"
            "<li>Verificação dos fatos relatados</li>"
            "<li>Senso de responsabilidade editorial com a fonte</li></ul>"
        ),
        "due_days": 20,
    },
]

# ---------------------------------------------------------------------------
# Submissões  (challenge_idx, student_idx, post_idx, grade, grader_idx)
# grade=None significa ainda não avaliada
# ---------------------------------------------------------------------------
# Definimos depois de ter os posts; usamos índices nos POSTS_DATA

SUBMISSIONS_DATA = [
    # challenge 0 (dados abertos) — avaliadas por prof_carlos (idx 2)
    {"challenge_idx": 0, "student_idx": 1, "post_idx": 8,  "grade": 9.0,  "grader_idx": 2},  # lucas → cooperativas
    {"challenge_idx": 0, "student_idx": 0, "post_idx": 0,  "grade": 8.5,  "grader_idx": 2},  # ana → LGPD
    # challenge 1 (fact-check)
    {"challenge_idx": 1, "student_idx": 1, "post_idx": 1,  "grade": 9.5,  "grader_idx": 2},  # lucas → polarização
    {"challenge_idx": 1, "student_idx": 0, "post_idx": 3,  "grade": 7.5,  "grader_idx": 2},  # ana → esportes
    # challenge 2 (podcast) — avaliadas por prof_fernanda (idx 3)
    {"challenge_idx": 2, "student_idx": 0, "post_idx": 17, "grade": 9.0,  "grader_idx": 3},  # ana → saúde mental áudio (idx 17)
    {"challenge_idx": 2, "student_idx": 1, "post_idx": 11, "grade": 8.0,  "grader_idx": 3},  # lucas → IA ciência (idx 11)
    # challenge 3 (fotografia)
    {"challenge_idx": 3, "student_idx": 0, "post_idx": 4,  "grade": None, "grader_idx": None},  # ana → atletas (idx 4, pending)
    {"challenge_idx": 3, "student_idx": 1, "post_idx": 5,  "grade": 8.5,  "grader_idx": 3},  # lucas → festival (idx 5)
    # challenge 4 (grande reportagem) — avaliadas por prof_carlos
    {"challenge_idx": 4, "student_idx": 7, "post_idx": 18, "grade": 9.5,  "grader_idx": 2},  # patricia → COP30 (idx 18)
    {"challenge_idx": 4, "student_idx": 0, "post_idx": 21, "grade": None, "grader_idx": None},  # ana → povos (idx 21, pending)
    # challenge 5 (perfil humano) — avaliadas por prof_fernanda
    {"challenge_idx": 5, "student_idx": 7, "post_idx": 20, "grade": 10.0, "grader_idx": 3},  # patricia → encarceramento (idx 20)
    {"challenge_idx": 5, "student_idx": 0, "post_idx": 16, "grade": 8.0,  "grader_idx": 3},  # ana → jovens jornalistas (idx 16)
]

# ---------------------------------------------------------------------------
# Helper de limpeza
# ---------------------------------------------------------------------------

async def clear_all(db):
    """Deleta dados demo em ordem inversa de FK. Preserva interests e editorias."""
    await db.execute(delete(Notification))
    await db.execute(delete(ChallengeSubmission))
    await db.execute(delete(Challenge))
    await db.execute(delete(GroupMember))
    await db.execute(delete(Group))
    await db.execute(delete(PostLike))
    await db.execute(delete(Comment))
    await db.execute(delete(PostMedia))
    await db.execute(delete(Post))
    await db.execute(text("DELETE FROM user_interests"))
    await db.execute(delete(User))
    await db.commit()
    print("  ✓ Dados anteriores removidos")


# ---------------------------------------------------------------------------
# Seed principal
# ---------------------------------------------------------------------------

async def seed():
    async with SessionLocal() as db:

        # 1. Limpar dados existentes
        await clear_all(db)

        # 2. Interests (INSERT IGNORE equivalente: verifica antes)
        for slug, label in INTERESTS:
            existing = await db.scalar(select(Interest).where(Interest.slug == slug))
            if not existing:
                db.add(Interest(slug=slug, label=label))
        await db.commit()

        # 3. Editorias
        for slug, label in EDITORIAS:
            existing = await db.scalar(select(Editoria).where(Editoria.slug == slug))
            if not existing:
                db.add(Editoria(slug=slug, label=label))
        await db.commit()

        # Mapas de lookup
        interests_map: dict[str, Interest] = {}
        for slug, _ in INTERESTS:
            interests_map[slug] = await db.scalar(select(Interest).where(Interest.slug == slug))

        editorias_map: dict[str, Editoria] = {}
        for slug, _ in EDITORIAS:
            editorias_map[slug] = await db.scalar(select(Editoria).where(Editoria.slug == slug))

        # 4. Usuários
        users: list[User] = []
        for email, username, display_name, account_type, bio, avatar, cover, interest_slugs in USERS_DATA:
            user = User(
                email=email,
                username=username,
                password_hash=hash_password("demo1234"),
                display_name=display_name,
                account_type=account_type,
                bio=bio,
                avatar_url=avatar,
                cover_url=cover,
            )
            db.add(user)
            await db.flush()  # obtém user.id sem commit

            # 5. Interesses do usuário
            for s in interest_slugs:
                if s in interests_map:
                    await db.execute(
                        user_interests.insert().values(user_id=user.id, interest_id=interests_map[s].id)
                    )
            users.append(user)

        await db.commit()
        for u in users:
            await db.refresh(u)
        print(f"  ✓ {len(users)} usuários criados")

        # 6. Posts
        posts: list[Post] = []
        for data in POSTS_DATA:
            editoria = editorias_map[data["editoria"]]
            user = users[data["user_idx"]]
            published = _dt(data["days_ago"]) if data["visibility"] == PostVisibility.public else None
            post = Post(
                user_id=user.id,
                editoria_id=editoria.id,
                title=data["title"],
                subtitle=data["subtitle"],
                format=data["format"],
                content_html=data["html"],
                cover_url=data["cover"],
                visibility=data["visibility"],
                published_at=published,
            )
            db.add(post)
            await db.flush()
            posts.append(post)

        await db.commit()
        for p in posts:
            await db.refresh(p)
        print(f"  ✓ {len(posts)} posts criados")

        # 7. PostMedia para posts photo/mixed
        media_count = 0
        for i, data in enumerate(POSTS_DATA):
            if data["format"] in (PostFormat.photo, PostFormat.mixed) and data["cover"]:
                pm = PostMedia(
                    post_id=posts[i].id,
                    media_type=MediaType.image,
                    url=data["cover"],
                    caption=data["title"],
                    credit="Arquivo/Redação",
                    position=0,
                )
                db.add(pm)
                media_count += 1
        await db.commit()
        print(f"  ✓ {media_count} registros de post_media criados")

        # 8. Likes (distribuição cruzada — evitar duplicatas)
        likes_set: set[tuple] = set()
        # pares fixos: (user_idx, post_idx)
        likes_raw = [
            (1, 0), (2, 0), (4, 0), (5, 0), (6, 0),
            (0, 1), (2, 1), (3, 1), (5, 1),
            (0, 3), (2, 3), (4, 3), (6, 3), (7, 3),
            (1, 5), (3, 5), (4, 5), (6, 5),
            (0, 6), (2, 6), (5, 6), (7, 6),
            (1, 7), (3, 7), (5, 7), (6, 7),
            (0, 10), (2, 10), (3, 10), (4, 10), (7, 10),
            (1, 11), (3, 11), (5, 11), (6, 11),
            (0, 12), (1, 12), (3, 12), (4, 12),
            (2, 16), (3, 16), (4, 16), (7, 16),
            (0, 18), (3, 18), (5, 18), (6, 18),
            (1, 20), (2, 20), (5, 20), (7, 20),
            (0, 21), (2, 21), (4, 21), (6, 21),
        ]
        for u_idx, p_idx in likes_raw:
            if p_idx < len(posts) and (u_idx, p_idx) not in likes_set:
                likes_set.add((u_idx, p_idx))
                db.add(PostLike(user_id=users[u_idx].id, post_id=posts[p_idx].id))
        await db.commit()
        print(f"  ✓ {len(likes_set)} likes criados")

        # 9. Comentários
        for post_idx, user_idx, content in COMMENTS_DATA:
            if post_idx < len(posts) and user_idx < len(users):
                db.add(Comment(
                    post_id=posts[post_idx].id,
                    user_id=users[user_idx].id,
                    content=content,
                ))
        await db.commit()
        print(f"  ✓ {len(COMMENTS_DATA)} comentários criados")

        # 10. Grupos e membros
        groups: list[Group] = []
        for gd in GROUPS_DATA:
            g = Group(
                name=gd["name"],
                description=gd["description"],
                created_by=users[gd["creator_idx"]].id,
            )
            db.add(g)
            await db.flush()
            # Owner
            db.add(GroupMember(group_id=g.id, user_id=users[gd["creator_idx"]].id, role=GroupMemberRole.owner))
            # Membros
            for m_idx in gd["members_idx"]:
                db.add(GroupMember(group_id=g.id, user_id=users[m_idx].id, role=GroupMemberRole.member))
            groups.append(g)
        await db.commit()
        for g in groups:
            await db.refresh(g)
        print(f"  ✓ {len(groups)} grupos criados")

        # 11. Desafios
        challenges: list[Challenge] = []
        for cd in CHALLENGES_DATA:
            c = Challenge(
                group_id=groups[cd["group_idx"]].id,
                created_by=users[cd["creator_idx"]].id,
                title=cd["title"],
                description_html=cd["description_html"],
                due_at=now + timedelta(days=cd["due_days"]),
            )
            db.add(c)
            await db.flush()
            challenges.append(c)
        await db.commit()
        for c in challenges:
            await db.refresh(c)
        print(f"  ✓ {len(challenges)} desafios criados")

        # 12. Submissões
        graded_count = 0
        for sd in SUBMISSIONS_DATA:
            c_idx = sd["challenge_idx"]
            p_idx = sd["post_idx"]
            if c_idx < len(challenges) and p_idx < len(posts):
                sub = ChallengeSubmission(
                    challenge_id=challenges[c_idx].id,
                    post_id=posts[p_idx].id,
                    user_id=users[sd["student_idx"]].id,
                    grade=sd["grade"],
                    graded_by=users[sd["grader_idx"]].id if sd["grader_idx"] is not None else None,
                    graded_at=now - timedelta(days=1) if sd["grade"] is not None else None,
                )
                db.add(sub)
                if sd["grade"] is not None:
                    graded_count += 1
        await db.commit()
        print(f"  ✓ {len(SUBMISSIONS_DATA)} submissões criadas ({graded_count} avaliadas)")

        # 13. Notificações
        notifs = []

        # type: challenge — alunos/membros notificados de novos desafios
        challenge_notif_targets = [
            (0, challenges[0], groups[0]),
            (1, challenges[0], groups[0]),
            (0, challenges[2], groups[1]),
            (1, challenges[2], groups[1]),
            (0, challenges[4], groups[2]),
            (7, challenges[4], groups[2]),
        ]
        for u_idx, c, g in challenge_notif_targets:
            notifs.append(Notification(
                user_id=users[u_idx].id,
                type=NotificationType.challenge,
                title=f"Novo desafio: {c.title[:60]}",
                body=f"O grupo '{g.name}' recebeu um novo desafio. Prazo: {c.due_at.strftime('%d/%m/%Y')}.",
                payload={"challenge_id": c.id, "group_id": g.id},
                is_read=False,
            ))

        # type: like — autores notificados de curtidas
        like_notif_data = [
            (4, users[1], posts[0], "Lucas Oliveira"),   # lucas curtiu post de maria
            (4, users[2], posts[0], "Prof. Carlos"),     # carlos curtiu post de maria
            (1, users[4], posts[3], "Maria Jornalista"), # maria curtiu post de lucas
            (0, users[2], posts[16], "Prof. Carlos"),    # carlos curtiu post de ana (jovens jornalistas, idx 16)
            (7, users[2], posts[18], "Prof. Carlos"),    # carlos curtiu post de patricia (COP30, idx 18)
            (5, users[3], posts[19], "Profa. Fernanda"), # fernanda curtiu post de rafael (jorn. ambiental, idx 19)
        ]
        for author_idx, liker, post, liker_name in like_notif_data:
            notifs.append(Notification(
                user_id=users[author_idx].id,
                type=NotificationType.like,
                title=f"{liker_name} curtiu sua publicação",
                body=f"Sua publicação '{post.title[:50]}...' recebeu uma curtida.",
                payload={"post_id": post.id, "liker_id": liker.id},
                is_read=True,  # likes marcados como lidos
            ))

        # type: group_invite — convites para grupos
        invite_notif_data = [
            (5, groups[0], "Laboratório de Jornalismo de Dados"),
            (6, groups[0], "Laboratório de Jornalismo de Dados"),
            (4, groups[1], "Redação Digital — Turma 2024"),
            (7, groups[1], "Redação Digital — Turma 2024"),
            (5, groups[2], "Coberturas Especiais: Meio Ambiente e Direitos Humanos"),
            (3, groups[2], "Coberturas Especiais: Meio Ambiente e Direitos Humanos"),
        ]
        for u_idx, g, g_name in invite_notif_data:
            notifs.append(Notification(
                user_id=users[u_idx].id,
                type=NotificationType.group_invite,
                title=f"Convite para o grupo: {g_name[:50]}",
                body=f"Você foi convidado para participar do grupo '{g_name}'. Use o token de convite para entrar.",
                payload={"group_id": g.id, "invite_token": g.invite_token},
                is_read=u_idx % 3 == 0,  # ~⅓ lidas
            ))

        for n in notifs:
            db.add(n)
        await db.commit()
        print(f"  ✓ {len(notifs)} notificações criadas")

        # ---------------------------------------------------------------------------
        print()
        print("✅ Seed completo! Plataforma pronta para demonstração.")
        print()
        print("  Usuários (senha: demo1234)")
        print("  ─────────────────────────────────────────────────────────────────")
        for email, username, display_name, account_type, *_ in USERS_DATA:
            print(f"  [{account_type.value:12s}] {email:<35} → @{username}")
        print()
        print(f"  Posts: {len(posts)}  |  Grupos: {len(groups)}  |  Desafios: {len(challenges)}")
        print(f"  Submissões: {len(SUBMISSIONS_DATA)}  |  Likes: {len(likes_set)}  |  "
              f"Comentários: {len(COMMENTS_DATA)}  |  Notificações: {len(notifs)}")


if __name__ == "__main__":
    asyncio.run(seed())
