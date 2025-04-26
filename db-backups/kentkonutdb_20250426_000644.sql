--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AnimationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AnimationType" AS ENUM (
    'FADE',
    'SLIDE',
    'ZOOM'
);


ALTER TYPE public."AnimationType" OWNER TO postgres;

--
-- Name: PlayMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlayMode" AS ENUM (
    'MANUAL',
    'AUTO'
);


ALTER TYPE public."PlayMode" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Banner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Banner" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "imageUrl" text NOT NULL,
    "linkUrl" text,
    active boolean DEFAULT true NOT NULL,
    "order" integer NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bannerGroupId" integer NOT NULL
);


ALTER TABLE public."Banner" OWNER TO postgres;

--
-- Name: BannerGroup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BannerGroup" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    duration integer DEFAULT 5000 NOT NULL,
    width integer DEFAULT 1920 NOT NULL,
    height integer DEFAULT 1080 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "playMode" text DEFAULT 'MANUAL'::text NOT NULL,
    animation text DEFAULT 'FADE'::text NOT NULL
);


ALTER TABLE public."BannerGroup" OWNER TO postgres;

--
-- Name: BannerGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BannerGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."BannerGroup_id_seq" OWNER TO postgres;

--
-- Name: BannerGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BannerGroup_id_seq" OWNED BY public."BannerGroup".id;


--
-- Name: Banner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Banner_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Banner_id_seq" OWNER TO postgres;

--
-- Name: Banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Banner_id_seq" OWNED BY public."Banner".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" integer NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Statistics" (
    id integer NOT NULL,
    "bannerId" integer NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Statistics" OWNER TO postgres;

--
-- Name: Statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Statistics_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Statistics_id_seq" OWNER TO postgres;

--
-- Name: Statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Statistics_id_seq" OWNED BY public."Statistics".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Banner id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Banner" ALTER COLUMN id SET DEFAULT nextval('public."Banner_id_seq"'::regclass);


--
-- Name: BannerGroup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BannerGroup" ALTER COLUMN id SET DEFAULT nextval('public."BannerGroup_id_seq"'::regclass);


--
-- Name: Statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Statistics" ALTER COLUMN id SET DEFAULT nextval('public."Statistics_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Banner" (id, title, description, "imageUrl", "linkUrl", active, "order", "startDate", "endDate", "createdAt", "updatedAt", "bannerGroupId") FROM stdin;
1	test	\N	/uploads/banner-1745611769144-776580336.jpg		t	1	\N	\N	2025-04-25 20:09:42.04	2025-04-25 20:34:42.687	8
2	nasmdas	\N	/uploads/banner-1745612253354-453552408.jpg		t	2	\N	\N	2025-04-25 20:17:40.43	2025-04-25 20:34:42.687	8
\.


--
-- Data for Name: BannerGroup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BannerGroup" (id, name, description, active, duration, width, height, "createdAt", "updatedAt", "playMode", animation) FROM stdin;
8	Hero Section	\N	t	5000	1920	1080	2025-04-25 20:02:09.042	2025-04-25 20:02:17.142	AUTO	FADE
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Statistics" (id, "bannerId", type, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, status, "emailVerified", image, "createdAt", "updatedAt") FROM stdin;
1	Necdet Oskay	noskay@kentkonut.com.tr	$2b$10$I/Yls38WO2ikIOyBBm4KuudLgLAUF.XDCjBjVvjRj8683Ajz2XMou	USER	ACTIVE	\N	\N	2025-04-25 18:35:47.88	2025-04-25 18:35:47.88
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1ece5613-c1c7-49c1-87dd-c9ca8dd9d4b3	4f11182f7e50efdbd4f0e173c64554677770f3769fe5e40ed84e102e20ec77e8	2025-04-25 21:34:15.7119+03	20250425124305_init	\N	\N	2025-04-25 21:34:15.685761+03	1
5714ad65-c821-4b61-9918-2c780fa20a94	62874c1014d9168812118256710290c87996df05ac9db1a99568c1aa4fd933b0	2025-04-25 21:38:09.093749+03	20250425183808_add_banner_enums	\N	\N	2025-04-25 21:38:09.08976+03	1
6026afbe-512e-4538-ae99-8bd8fc9fff06	33940fec807d7909011ee592235d13efdb4166947ac6ebf1bcc32a05ba7c4015	2025-04-25 22:31:38.317695+03	20250425193137_fix_banner_enums	\N	\N	2025-04-25 22:31:38.313651+03	1
\.


--
-- Name: BannerGroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BannerGroup_id_seq"', 8, true);


--
-- Name: Banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Banner_id_seq"', 2, true);


--
-- Name: Statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Statistics_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, true);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: BannerGroup BannerGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BannerGroup"
    ADD CONSTRAINT "BannerGroup_pkey" PRIMARY KEY (id);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Statistics Statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Statistics"
    ADD CONSTRAINT "Statistics_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: BannerGroup_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BannerGroup_active_idx" ON public."BannerGroup" USING btree (active);


--
-- Name: BannerGroup_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BannerGroup_createdAt_idx" ON public."BannerGroup" USING btree ("createdAt");


--
-- Name: Banner_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Banner_active_idx" ON public."Banner" USING btree (active);


--
-- Name: Banner_bannerGroupId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Banner_bannerGroupId_idx" ON public."Banner" USING btree ("bannerGroupId");


--
-- Name: Banner_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Banner_createdAt_idx" ON public."Banner" USING btree ("createdAt");


--
-- Name: Banner_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Banner_order_idx" ON public."Banner" USING btree ("order");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Statistics_bannerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Statistics_bannerId_idx" ON public."Statistics" USING btree ("bannerId");


--
-- Name: Statistics_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Statistics_createdAt_idx" ON public."Statistics" USING btree ("createdAt");


--
-- Name: Statistics_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Statistics_type_idx" ON public."Statistics" USING btree (type);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Banner Banner_bannerGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_bannerGroupId_fkey" FOREIGN KEY ("bannerGroupId") REFERENCES public."BannerGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Statistics Statistics_bannerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Statistics"
    ADD CONSTRAINT "Statistics_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES public."Banner"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

