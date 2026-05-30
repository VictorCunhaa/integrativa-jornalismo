"""Popula o banco com dados de demonstração."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, text

from app.config import settings
from app.models.user import User, Interest, AccountType, user_interests
from app.models.editoria import Editoria
from app.models.post import Post, PostFormat, PostVisibility
from app.models.comment import Comment
from app.security import hash_password

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

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

EDITORIAS = INTERESTS  # mesmo seed

USERS = [
    ("aluno@demo.br", "aluno_demo", "demo1234", "Ana Silva", AccountType.student),
    ("professor@demo.br", "prof_demo", "demo1234", "Prof. Carlos Mendes", AccountType.professor),
    ("egresso@demo.br", "egresso_demo", "demo1234", "João Egresso", AccountType.alumni),
    ("profissional@demo.br", "jornalista_demo", "demo1234", "Maria Jornalista", AccountType.professional),
]

POSTS_DATA = [
    {
        "title": "O que muda com a nova lei de proteção de dados para jornalistas",
        "subtitle": "Especialistas debatem impactos da regulamentação no cotidiano das redações",
        "format": PostFormat.text,
        "editoria_slug": "politica",
        "content_html": "<p>A aprovação da nova regulamentação de proteção de dados trouxe questionamentos importantes para o exercício do jornalismo no Brasil.</p><p>Fontes ouvidas pela reportagem apontam que a lei exige adaptações nas rotinas de coleta e armazenamento de informações de fontes.</p><blockquote><p>\"O jornalismo investigativo precisa de clareza sobre o que pode ou não ser guardado\", afirma especialista em direito digital.</p></blockquote><p>A discussão está longe de terminar, e as redações já começam a rever seus protocolos internos.</p>",
        "user_idx": 0,
    },
    {
        "title": "Cobertura esportiva: como os dados mudaram o futebol brasileiro",
        "subtitle": "Data journalism transforma análise de desempenho nas equipes da Série A",
        "format": PostFormat.text,
        "editoria_slug": "esportes",
        "content_html": "<h2>A revolução dos dados</h2><p>O futebol brasileiro vive uma transformação silenciosa: clubes da Série A do Campeonato Brasileiro passaram a investir em analistas de dados para guiar contratações e táticas de jogo.</p><p>Com softwares de rastreamento e inteligência artificial, times pequenos conseguem competir com orçamentos maiores ao identificar talentos subvalorizados.</p><p>A reportagem visitou três clubes que adotaram essa filosofia e conversou com os profissionais por trás da mudança.</p>",
        "user_idx": 3,
    },
    {
        "title": "Festival de Cinema de Tiradentes: o que esperar da edição deste ano",
        "subtitle": "Programação inclui retrospectiva de diretoras brasileiras e debates sobre financiamento",
        "format": PostFormat.text,
        "editoria_slug": "cultura",
        "content_html": "<p>O Festival de Cinema de Tiradentes chega à sua nova edição com uma programação que celebra o cinema independente nacional.</p><p>A curadoria deste ano priorizou obras de realizadoras mulheres, com uma mostra especial que reúne filmes das décadas de 1970 a 2020.</p><p>Entre os destaques, um debate inédito sobre o modelo de financiamento de filmes brasileiros e os desafios pós-pandemia para salas de cinema.</p>",
        "user_idx": 2,
    },
    {
        "title": "Inflação e aluguel: como famílias de baixa renda estão se adaptando em São Paulo",
        "subtitle": "Reportagem ouve moradores de cortiços e movimentos de luta por moradia",
        "format": PostFormat.text,
        "editoria_slug": "economia",
        "content_html": "<p>Com o aluguel em alta na capital paulista, famílias de baixa renda relatam dificuldades crescentes para manter moradia digna.</p><p>A reportagem percorreu bairros centrais de São Paulo e registrou histórias de quem enfrenta diretamente a crise habitacional.</p><p>\"Antes eu pagava R$ 800 por um quarto. Agora o mesmo quarto custa R$ 1.400\", conta uma costureira de 42 anos, moradora do bairro Brás.</p>",
        "user_idx": 1,
    },
    {
        "title": "Pesquisadores da USP desenvolvem vacina contra dengue de baixo custo",
        "subtitle": "Tecnologia pode ser aplicada em países em desenvolvimento sem cadeia de frio",
        "format": PostFormat.text,
        "editoria_slug": "ciencia",
        "content_html": "<p>Um grupo de pesquisadores da Universidade de São Paulo anunciou avanços significativos no desenvolvimento de uma vacina contra dengue que pode ser armazenada sem necessidade de refrigeração constante.</p><p>A tecnologia, baseada em nanopartículas lipídicas, representa um passo importante para a democratização do imunizante em regiões com infraestrutura limitada.</p><p>Os testes clínicos de fase 2 devem começar no próximo semestre, segundo os coordenadores do projeto.</p>",
        "user_idx": 0,
    },
    {
        "title": "Startups brasileiras de IA: entre o hype e a realidade do mercado",
        "subtitle": "Levantamento aponta que apenas 12% das empresas que se declaram 'de IA' usam a tecnologia como core",
        "format": PostFormat.text,
        "editoria_slug": "tecnologia",
        "content_html": "<p>O Brasil tem mais de 3.000 empresas que se autodenominam startups de inteligência artificial, mas pesquisa recente indica que apenas uma fração delas tem a tecnologia como componente central do negócio.</p><p>Especialistas alertam que o fenômeno do 'AI washing' — usar o rótulo de IA para atrair investimento sem a substância tecnológica — prejudica o ecossistema.</p><p>\"Investidores estão cada vez mais criteriosos. O rótulo não basta; pedem métricas de uso real da tecnologia\", diz analista do setor.</p>",
        "user_idx": 3,
    },
    {
        "title": "COP30 na Amazônia: o que está em jogo para o Brasil",
        "subtitle": "País recebe a conferência climática da ONU em 2025 em meio a pressões ambientais",
        "format": PostFormat.text,
        "editoria_slug": "meio-ambiente",
        "content_html": "<p>A realização da COP30 no Brasil representa uma oportunidade histórica — e uma enorme responsabilidade. O país que abriga a maior floresta tropical do mundo precisará mostrar ao mundo que suas políticas ambientais estão à altura do desafio.</p><p>Especialistas consultados pela reportagem são unânimes: a credibilidade do Brasil nas negociações climáticas passa pelo desmatamento da Amazônia.</p><p>Com metas ambiciosas anunciadas, o governo terá que traduzir compromissos em ações concretas até novembro de 2025.</p>",
        "user_idx": 2,
    },
    {
        "title": "Jovens jornalistas e o mercado: como as novas gerações estão reinventando a profissão",
        "subtitle": "Alunos de jornalismo falam sobre expectativas, desafios e novos modelos de trabalho",
        "format": PostFormat.mixed,
        "editoria_slug": "cotidiano",
        "content_html": "<p>A geração que está chegando ao mercado de trabalho jornalístico carrega experiências únicas: cresceram com a internet, viveram a queda dos classificados nos jornais e a ascensão das newsletters independentes.</p><p>Em entrevistas com estudantes de comunicação de cinco universidades brasileiras, a reportagem identificou um perfil em transformação: mais disposto ao empreendedorismo, ao jornalismo de dados e às plataformas digitais.</p><p>\"Não espero trabalhar em um grande veículo por 30 anos. Quero criar o meu próprio espaço\", diz estudante do 4º ano de jornalismo em Salvador.</p>",
        "user_idx": 1,
    },
]

COMMENTS_DATA = [
    (0, 0, "Excelente reportagem! A questão das fontes anônimas é um ponto crítico que merece mais debate."),
    (0, 1, "Concordo com a análise. As redações precisam urgentemente de políticas claras nessa área."),
    (1, 2, "O futebol brasileiro finalmente entrando na era dos dados. Já era hora!"),
    (1, 3, "Interessante ver como clubes menores podem se beneficiar dessa abordagem analítica."),
    (2, 0, "Festival incrível! Fui no ano passado e a experiência foi transformadora."),
    (3, 1, "Reportagem importante. A crise habitacional em SP é uma emergência que precisa de mais cobertura."),
    (3, 2, "Os números são assustadores. Precisamos de políticas públicas urgentes."),
    (4, 3, "Que notícia fantástica! Vacina sem cadeia de frio pode revolucionar o combate à dengue."),
    (5, 0, "Muito importante esse alerta sobre AI washing. O setor precisa de mais transparência."),
    (6, 1, "Brasil tem responsabilidade histórica na COP30. Esperamos resultados concretos."),
    (7, 2, "Me identifico muito com essa geração. O jornalismo independente é o caminho!"),
    (7, 3, "Ótima matéria. Os novos formatos de jornalismo são essenciais para a sobrevivência da profissão."),
]


async def seed():
    async with SessionLocal() as db:
        # Interests
        for slug, label in INTERESTS:
            existing = await db.scalar(select(Interest).where(Interest.slug == slug))
            if not existing:
                db.add(Interest(slug=slug, label=label))
        await db.commit()

        # Editorias
        for slug, label in EDITORIAS:
            existing = await db.scalar(select(Editoria).where(Editoria.slug == slug))
            if not existing:
                db.add(Editoria(slug=slug, label=label))
        await db.commit()

        # Users
        users: list[User] = []
        for email, username, password, display_name, account_type in USERS:
            existing = await db.scalar(select(User).where(User.email == email))
            if not existing:
                user = User(
                    email=email,
                    username=username,
                    password_hash=hash_password(password),
                    display_name=display_name,
                    account_type=account_type,
                    bio=f"Olá! Sou {display_name}. Bem-vindo ao meu perfil na Redação-Escola Digital.",
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
                users.append(user)
            else:
                users.append(existing)

        # Posts
        posts: list[Post] = []
        for data in POSTS_DATA:
            existing = await db.scalar(select(Post).where(Post.title == data["title"]))
            if not existing:
                editoria = await db.scalar(
                    select(Editoria).where(Editoria.slug == data["editoria_slug"])
                )
                user = users[data["user_idx"]]
                post = Post(
                    user_id=user.id,
                    editoria_id=editoria.id,
                    title=data["title"],
                    subtitle=data["subtitle"],
                    format=data["format"],
                    content_html=data["content_html"],
                    visibility=PostVisibility.public,
                    published_at=datetime.now(timezone.utc),
                )
                db.add(post)
                await db.commit()
                await db.refresh(post)
                posts.append(post)
            else:
                posts.append(existing)

        # Comments
        for post_idx, user_idx, content in COMMENTS_DATA:
            if post_idx < len(posts) and user_idx < len(users):
                post = posts[post_idx]
                user = users[user_idx]
                existing = await db.scalar(
                    select(Comment).where(
                        Comment.post_id == post.id,
                        Comment.user_id == user.id,
                        Comment.content == content,
                    )
                )
                if not existing:
                    db.add(Comment(post_id=post.id, user_id=user.id, content=content))
        await db.commit()

        print("✓ Seed concluído com sucesso!")
        print("  Usuários demo: aluno@demo.br, professor@demo.br, egresso@demo.br, profissional@demo.br")
        print("  Senha: demo1234")


if __name__ == "__main__":
    asyncio.run(seed())
