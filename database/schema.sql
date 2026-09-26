--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

-- Started on 2026-09-26 17:00:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 212 (class 1259 OID 16413)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    company_name character varying(150) NOT NULL,
    contact_person character varying(100) NOT NULL,
    mobile character varying(20) NOT NULL,
    email character varying(150),
    city character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16412)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 3508 (class 0 OID 0)
-- Dependencies: 211
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 232 (class 1259 OID 16627)
-- Name: dispatch_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispatch_items (
    id integer NOT NULL,
    dispatch_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT dispatch_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.dispatch_items OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16626)
-- Name: dispatch_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispatch_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dispatch_items_id_seq OWNER TO postgres;

--
-- TOC entry 3509 (class 0 OID 0)
-- Dependencies: 231
-- Name: dispatch_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispatch_items_id_seq OWNED BY public.dispatch_items.id;


--
-- TOC entry 230 (class 1259 OID 16604)
-- Name: dispatches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispatches (
    id integer NOT NULL,
    dispatch_number character varying(50) NOT NULL,
    sales_order_id integer NOT NULL,
    dispatch_date date DEFAULT CURRENT_DATE NOT NULL,
    vehicle_number character varying(30) NOT NULL,
    driver_name character varying(100) NOT NULL,
    dispatched_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dispatches OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16603)
-- Name: dispatches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispatches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dispatches_id_seq OWNER TO postgres;

--
-- TOC entry 3510 (class 0 OID 0)
-- Dependencies: 229
-- Name: dispatches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispatches_id_seq OWNED BY public.dispatches.id;


--
-- TOC entry 218 (class 1259 OID 16453)
-- Name: enquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enquiries (
    id integer NOT NULL,
    enquiry_number character varying(50) NOT NULL,
    customer_id integer NOT NULL,
    created_by integer NOT NULL,
    enquiry_date date DEFAULT CURRENT_DATE NOT NULL,
    required_date date NOT NULL,
    notes text,
    status character varying(20) DEFAULT 'NEW'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enquiries_status_check CHECK (((status)::text = ANY ((ARRAY['NEW'::character varying, 'QUOTED'::character varying, 'WON'::character varying, 'LOST'::character varying])::text[]))),
    CONSTRAINT valid_enquiry_dates CHECK ((required_date >= enquiry_date))
);


ALTER TABLE public.enquiries OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16452)
-- Name: enquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.enquiries_id_seq OWNER TO postgres;

--
-- TOC entry 3511 (class 0 OID 0)
-- Dependencies: 217
-- Name: enquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enquiries_id_seq OWNED BY public.enquiries.id;


--
-- TOC entry 220 (class 1259 OID 16479)
-- Name: enquiry_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enquiry_items (
    id integer NOT NULL,
    enquiry_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT enquiry_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.enquiry_items OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16478)
-- Name: enquiry_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enquiry_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.enquiry_items_id_seq OWNER TO postgres;

--
-- TOC entry 3512 (class 0 OID 0)
-- Dependencies: 219
-- Name: enquiry_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enquiry_items_id_seq OWNED BY public.enquiry_items.id;


--
-- TOC entry 216 (class 1259 OID 16434)
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    product_id integer NOT NULL,
    physical_quantity integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    CONSTRAINT inventory_physical_quantity_check CHECK ((physical_quantity >= 0)),
    CONSTRAINT inventory_reserved_quantity_check CHECK ((reserved_quantity >= 0)),
    CONSTRAINT valid_reservation CHECK ((reserved_quantity <= physical_quantity))
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16433)
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_id_seq OWNER TO postgres;

--
-- TOC entry 3513 (class 0 OID 0)
-- Dependencies: 215
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- TOC entry 214 (class 1259 OID 16423)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_code character varying(50) NOT NULL,
    product_name character varying(150) NOT NULL,
    category character varying(100) NOT NULL,
    unit character varying(20) NOT NULL,
    base_price numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_base_price_check CHECK ((base_price >= (0)::numeric))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16422)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 3514 (class 0 OID 0)
-- Dependencies: 213
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 224 (class 1259 OID 16530)
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_items (
    id integer NOT NULL,
    quotation_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0 NOT NULL,
    gst_percent numeric(5,2) DEFAULT 0 NOT NULL,
    line_amount numeric(12,2) NOT NULL,
    CONSTRAINT quotation_items_discount_percent_check CHECK (((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric))),
    CONSTRAINT quotation_items_gst_percent_check CHECK (((gst_percent >= (0)::numeric) AND (gst_percent <= (100)::numeric))),
    CONSTRAINT quotation_items_line_amount_check CHECK ((line_amount >= (0)::numeric)),
    CONSTRAINT quotation_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT quotation_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.quotation_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16529)
-- Name: quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quotation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotation_items_id_seq OWNER TO postgres;

--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 223
-- Name: quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quotation_items_id_seq OWNED BY public.quotation_items.id;


--
-- TOC entry 222 (class 1259 OID 16499)
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    quotation_number character varying(50) NOT NULL,
    enquiry_id integer NOT NULL,
    customer_id integer NOT NULL,
    created_by integer NOT NULL,
    quotation_date date DEFAULT CURRENT_DATE NOT NULL,
    valid_until date NOT NULL,
    grand_total numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quotations_grand_total_check CHECK ((grand_total >= (0)::numeric)),
    CONSTRAINT quotations_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SENT'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT valid_quotation_dates CHECK ((valid_until >= quotation_date))
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16498)
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotations_id_seq OWNER TO postgres;

--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 221
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- TOC entry 228 (class 1259 OID 16582)
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_order_items (
    id integer NOT NULL,
    sales_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    line_amount numeric(12,2) NOT NULL,
    CONSTRAINT sales_order_items_line_amount_check CHECK ((line_amount >= (0)::numeric)),
    CONSTRAINT sales_order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT sales_order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.sales_order_items OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16581)
-- Name: sales_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_order_items_id_seq OWNER TO postgres;

--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 227
-- Name: sales_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_order_items_id_seq OWNED BY public.sales_order_items.id;


--
-- TOC entry 226 (class 1259 OID 16556)
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    customer_id integer NOT NULL,
    quotation_id integer NOT NULL,
    order_date date DEFAULT CURRENT_DATE NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sales_orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'DISPATCHED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT sales_orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.sales_orders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16555)
-- Name: sales_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_orders_id_seq OWNER TO postgres;

--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 225
-- Name: sales_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_orders_id_seq OWNED BY public.sales_orders.id;


--
-- TOC entry 210 (class 1259 OID 16400)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'SALES_USER'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16399)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3222 (class 2604 OID 16416)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 3270 (class 2604 OID 16630)
-- Name: dispatch_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items ALTER COLUMN id SET DEFAULT nextval('public.dispatch_items_id_seq'::regclass);


--
-- TOC entry 3267 (class 2604 OID 16607)
-- Name: dispatches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches ALTER COLUMN id SET DEFAULT nextval('public.dispatches_id_seq'::regclass);


--
-- TOC entry 3233 (class 2604 OID 16456)
-- Name: enquiries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries ALTER COLUMN id SET DEFAULT nextval('public.enquiries_id_seq'::regclass);


--
-- TOC entry 3239 (class 2604 OID 16482)
-- Name: enquiry_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiry_items ALTER COLUMN id SET DEFAULT nextval('public.enquiry_items_id_seq'::regclass);


--
-- TOC entry 3227 (class 2604 OID 16437)
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- TOC entry 3224 (class 2604 OID 16426)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3249 (class 2604 OID 16533)
-- Name: quotation_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items ALTER COLUMN id SET DEFAULT nextval('public.quotation_items_id_seq'::regclass);


--
-- TOC entry 3241 (class 2604 OID 16502)
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- TOC entry 3263 (class 2604 OID 16585)
-- Name: sales_order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items ALTER COLUMN id SET DEFAULT nextval('public.sales_order_items_id_seq'::regclass);


--
-- TOC entry 3257 (class 2604 OID 16559)
-- Name: sales_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders ALTER COLUMN id SET DEFAULT nextval('public.sales_orders_id_seq'::regclass);


--
-- TOC entry 3219 (class 2604 OID 16403)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3482 (class 0 OID 16413)
-- Dependencies: 212
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, company_name, contact_person, mobile, email, city, created_at) FROM stdin;
\.


--
-- TOC entry 3502 (class 0 OID 16627)
-- Dependencies: 232
-- Data for Name: dispatch_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatch_items (id, dispatch_id, product_id, quantity) FROM stdin;
\.


--
-- TOC entry 3500 (class 0 OID 16604)
-- Dependencies: 230
-- Data for Name: dispatches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatches (id, dispatch_number, sales_order_id, dispatch_date, vehicle_number, driver_name, dispatched_by, created_at) FROM stdin;
\.


--
-- TOC entry 3488 (class 0 OID 16453)
-- Dependencies: 218
-- Data for Name: enquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiries (id, enquiry_number, customer_id, created_by, enquiry_date, required_date, notes, status, created_at) FROM stdin;
\.


--
-- TOC entry 3490 (class 0 OID 16479)
-- Dependencies: 220
-- Data for Name: enquiry_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enquiry_items (id, enquiry_id, product_id, quantity) FROM stdin;
\.


--
-- TOC entry 3486 (class 0 OID 16434)
-- Dependencies: 216
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, product_id, physical_quantity, reserved_quantity) FROM stdin;
\.


--
-- TOC entry 3484 (class 0 OID 16423)
-- Dependencies: 214
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, product_code, product_name, category, unit, base_price, created_at) FROM stdin;
\.


--
-- TOC entry 3494 (class 0 OID 16530)
-- Dependencies: 224
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_items (id, quotation_id, product_id, quantity, unit_price, discount_percent, gst_percent, line_amount) FROM stdin;
\.


--
-- TOC entry 3492 (class 0 OID 16499)
-- Dependencies: 222
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, quotation_number, enquiry_id, customer_id, created_by, quotation_date, valid_until, grand_total, status, created_at) FROM stdin;
\.


--
-- TOC entry 3498 (class 0 OID 16582)
-- Dependencies: 228
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_order_items (id, sales_order_id, product_id, quantity, unit_price, line_amount) FROM stdin;
\.


--
-- TOC entry 3496 (class 0 OID 16556)
-- Dependencies: 226
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_orders (id, order_number, customer_id, quotation_id, order_date, total_amount, status, created_at) FROM stdin;
\.


--
-- TOC entry 3480 (class 0 OID 16400)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, created_at) FROM stdin;
\.


--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 211
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 231
-- Name: dispatch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispatch_items_id_seq', 1, false);


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 229
-- Name: dispatches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispatches_id_seq', 1, false);


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 217
-- Name: enquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enquiries_id_seq', 1, false);


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 219
-- Name: enquiry_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enquiry_items_id_seq', 1, false);


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 215
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_id_seq', 1, false);


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 213
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 223
-- Name: quotation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotation_items_id_seq', 1, false);


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 221
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotations_id_seq', 1, false);


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 227
-- Name: sales_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_order_items_id_seq', 1, false);


--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 225
-- Name: sales_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_orders_id_seq', 1, false);


--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 209
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 3277 (class 2606 OID 16421)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3319 (class 2606 OID 16635)
-- Name: dispatch_items dispatch_items_dispatch_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_dispatch_id_product_id_key UNIQUE (dispatch_id, product_id);


--
-- TOC entry 3321 (class 2606 OID 16633)
-- Name: dispatch_items dispatch_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3313 (class 2606 OID 16613)
-- Name: dispatches dispatches_dispatch_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_dispatch_number_key UNIQUE (dispatch_number);


--
-- TOC entry 3315 (class 2606 OID 16611)
-- Name: dispatches dispatches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 16615)
-- Name: dispatches dispatches_sales_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_sales_order_id_key UNIQUE (sales_order_id);


--
-- TOC entry 3287 (class 2606 OID 16467)
-- Name: enquiries enquiries_enquiry_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_enquiry_number_key UNIQUE (enquiry_number);


--
-- TOC entry 3289 (class 2606 OID 16465)
-- Name: enquiries enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);


--
-- TOC entry 3291 (class 2606 OID 16487)
-- Name: enquiry_items enquiry_items_enquiry_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiry_items
    ADD CONSTRAINT enquiry_items_enquiry_id_product_id_key UNIQUE (enquiry_id, product_id);


--
-- TOC entry 3293 (class 2606 OID 16485)
-- Name: enquiry_items enquiry_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiry_items
    ADD CONSTRAINT enquiry_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3283 (class 2606 OID 16444)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 3285 (class 2606 OID 16446)
-- Name: inventory inventory_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_key UNIQUE (product_id);


--
-- TOC entry 3279 (class 2606 OID 16430)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3281 (class 2606 OID 16432)
-- Name: products products_product_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_code_key UNIQUE (product_code);


--
-- TOC entry 3299 (class 2606 OID 16542)
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3301 (class 2606 OID 16544)
-- Name: quotation_items quotation_items_quotation_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_product_id_key UNIQUE (quotation_id, product_id);


--
-- TOC entry 3295 (class 2606 OID 16511)
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- TOC entry 3297 (class 2606 OID 16513)
-- Name: quotations quotations_quotation_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_number_key UNIQUE (quotation_number);


--
-- TOC entry 3309 (class 2606 OID 16590)
-- Name: sales_order_items sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3311 (class 2606 OID 16592)
-- Name: sales_order_items sales_order_items_sales_order_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_sales_order_id_product_id_key UNIQUE (sales_order_id, product_id);


--
-- TOC entry 3303 (class 2606 OID 16568)
-- Name: sales_orders sales_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 3305 (class 2606 OID 16566)
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3307 (class 2606 OID 16570)
-- Name: sales_orders sales_orders_quotation_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_quotation_id_key UNIQUE (quotation_id);


--
-- TOC entry 3273 (class 2606 OID 16411)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3275 (class 2606 OID 16409)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 16636)
-- Name: dispatch_items dispatch_items_dispatch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_dispatch_id_fkey FOREIGN KEY (dispatch_id) REFERENCES public.dispatches(id);


--
-- TOC entry 3339 (class 2606 OID 16641)
-- Name: dispatch_items dispatch_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_items
    ADD CONSTRAINT dispatch_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3337 (class 2606 OID 16621)
-- Name: dispatches dispatches_dispatched_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_dispatched_by_fkey FOREIGN KEY (dispatched_by) REFERENCES public.users(id);


--
-- TOC entry 3336 (class 2606 OID 16616)
-- Name: dispatches dispatches_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id);


--
-- TOC entry 3324 (class 2606 OID 16473)
-- Name: enquiries enquiries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3323 (class 2606 OID 16468)
-- Name: enquiries enquiries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3325 (class 2606 OID 16488)
-- Name: enquiry_items enquiry_items_enquiry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiry_items
    ADD CONSTRAINT enquiry_items_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES public.enquiries(id) ON DELETE CASCADE;


--
-- TOC entry 3326 (class 2606 OID 16493)
-- Name: enquiry_items enquiry_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enquiry_items
    ADD CONSTRAINT enquiry_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3322 (class 2606 OID 16447)
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3331 (class 2606 OID 16550)
-- Name: quotation_items quotation_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3330 (class 2606 OID 16545)
-- Name: quotation_items quotation_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- TOC entry 3329 (class 2606 OID 16524)
-- Name: quotations quotations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3328 (class 2606 OID 16519)
-- Name: quotations quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3327 (class 2606 OID 16514)
-- Name: quotations quotations_enquiry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES public.enquiries(id);


--
-- TOC entry 3335 (class 2606 OID 16598)
-- Name: sales_order_items sales_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3334 (class 2606 OID 16593)
-- Name: sales_order_items sales_order_items_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;


--
-- TOC entry 3332 (class 2606 OID 16571)
-- Name: sales_orders sales_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3333 (class 2606 OID 16576)
-- Name: sales_orders sales_orders_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id);


-- Completed on 2026-09-26 17:00:50

--
-- PostgreSQL database dump complete
--

