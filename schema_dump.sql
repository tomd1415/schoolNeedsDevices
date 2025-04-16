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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    category_description text
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_category_id_seq OWNER TO postgres;

--
-- Name: category_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;


--
-- Name: device; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device (
    device_id integer NOT NULL,
    image_link text,
    device_name text,
    device_model text,
    device_serial_number text,
    device_warranty_info text,
    device_status text,
    device_notes text,
    device_purchase_date date,
    device_category_id integer
);


ALTER TABLE public.device OWNER TO postgres;

--
-- Name: device_device_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.device_device_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_device_id_seq OWNER TO postgres;

--
-- Name: device_device_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.device_device_id_seq OWNED BY public.device.device_id;


--
-- Name: form; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form (
    form_id integer NOT NULL,
    form_year integer NOT NULL,
    form_name character varying(255) NOT NULL,
    teacher_name text,
    form_description text,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.form OWNER TO postgres;

--
-- Name: form_form_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_form_id_seq OWNER TO postgres;

--
-- Name: form_form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_form_id_seq OWNED BY public.form.form_id;


--
-- Name: need; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.need (
    need_id integer NOT NULL,
    category_id integer NOT NULL,
    need_name text,
    need_short_desc text,
    need_long_desc text
);


ALTER TABLE public.need OWNER TO postgres;

--
-- Name: need_device; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.need_device (
    need_device_id integer NOT NULL,
    need_id integer NOT NULL,
    device_id integer NOT NULL,
    note text
);


ALTER TABLE public.need_device OWNER TO postgres;

--
-- Name: need_device_need_device_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.need_device_need_device_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.need_device_need_device_id_seq OWNER TO postgres;

--
-- Name: need_device_need_device_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.need_device_need_device_id_seq OWNED BY public.need_device.need_device_id;


--
-- Name: need_need_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.need_need_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.need_need_id_seq OWNER TO postgres;

--
-- Name: need_need_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.need_need_id_seq OWNED BY public.need.need_id;


--
-- Name: pupil; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pupil (
    pupil_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    form_id integer,
    notes text
);


ALTER TABLE public.pupil OWNER TO postgres;

--
-- Name: pupil_device_alter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pupil_device_alter (
    pupil_device_alter_id integer NOT NULL,
    pupil_id integer NOT NULL,
    device_id integer NOT NULL,
    add_remove character varying(10) NOT NULL,
    note text,
    CONSTRAINT pupil_device_alter_add_remove_check CHECK (((add_remove)::text = ANY ((ARRAY['add'::character varying, 'remove'::character varying, 'edit'::character varying])::text[])))
);


ALTER TABLE public.pupil_device_alter OWNER TO postgres;

--
-- Name: pupil_device_alter_pupil_device_alter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pupil_device_alter_pupil_device_alter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pupil_device_alter_pupil_device_alter_id_seq OWNER TO postgres;

--
-- Name: pupil_device_alter_pupil_device_alter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pupil_device_alter_pupil_device_alter_id_seq OWNED BY public.pupil_device_alter.pupil_device_alter_id;


--
-- Name: pupil_need; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pupil_need (
    pupil_need_id integer NOT NULL,
    pupil_id integer NOT NULL,
    need_id integer NOT NULL,
    note text
);


ALTER TABLE public.pupil_need OWNER TO postgres;

--
-- Name: pupil_need_pupil_need_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pupil_need_pupil_need_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pupil_need_pupil_need_id_seq OWNER TO postgres;

--
-- Name: pupil_need_pupil_need_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pupil_need_pupil_need_id_seq OWNED BY public.pupil_need.pupil_need_id;


--
-- Name: pupil_pupil_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pupil_pupil_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pupil_pupil_id_seq OWNER TO postgres;

--
-- Name: pupil_pupil_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pupil_pupil_id_seq OWNED BY public.pupil.pupil_id;


--
-- Name: category category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);


--
-- Name: device device_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device ALTER COLUMN device_id SET DEFAULT nextval('public.device_device_id_seq'::regclass);


--
-- Name: form form_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form ALTER COLUMN form_id SET DEFAULT nextval('public.form_form_id_seq'::regclass);


--
-- Name: need need_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need ALTER COLUMN need_id SET DEFAULT nextval('public.need_need_id_seq'::regclass);


--
-- Name: need_device need_device_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need_device ALTER COLUMN need_device_id SET DEFAULT nextval('public.need_device_need_device_id_seq'::regclass);


--
-- Name: pupil pupil_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil ALTER COLUMN pupil_id SET DEFAULT nextval('public.pupil_pupil_id_seq'::regclass);


--
-- Name: pupil_device_alter pupil_device_alter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_device_alter ALTER COLUMN pupil_device_alter_id SET DEFAULT nextval('public.pupil_device_alter_pupil_device_alter_id_seq'::regclass);


--
-- Name: pupil_need pupil_need_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_need ALTER COLUMN pupil_need_id SET DEFAULT nextval('public.pupil_need_pupil_need_id_seq'::regclass);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (device_id);


--
-- Name: form form_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT form_pkey PRIMARY KEY (form_id);


--
-- Name: need_device need_device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need_device
    ADD CONSTRAINT need_device_pkey PRIMARY KEY (need_device_id);


--
-- Name: need need_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_pkey PRIMARY KEY (need_id);


--
-- Name: pupil_device_alter pupil_device_alter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_device_alter
    ADD CONSTRAINT pupil_device_alter_pkey PRIMARY KEY (pupil_device_alter_id);


--
-- Name: pupil_need pupil_need_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_need
    ADD CONSTRAINT pupil_need_pkey PRIMARY KEY (pupil_need_id);


--
-- Name: pupil pupil_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil
    ADD CONSTRAINT pupil_pkey PRIMARY KEY (pupil_id);


--
-- Name: need need_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need
    ADD CONSTRAINT need_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id);


--
-- Name: need_device need_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need_device
    ADD CONSTRAINT need_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(device_id) ON DELETE CASCADE;


--
-- Name: need_device need_device_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.need_device
    ADD CONSTRAINT need_device_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.need(need_id) ON DELETE CASCADE;


--
-- Name: pupil_device_alter pupil_device_alter_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_device_alter
    ADD CONSTRAINT pupil_device_alter_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(device_id) ON DELETE CASCADE;


--
-- Name: pupil_device_alter pupil_device_alter_pupil_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_device_alter
    ADD CONSTRAINT pupil_device_alter_pupil_id_fkey FOREIGN KEY (pupil_id) REFERENCES public.pupil(pupil_id) ON DELETE CASCADE;


--
-- Name: pupil pupil_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil
    ADD CONSTRAINT pupil_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.form(form_id);


--
-- Name: pupil_need pupil_need_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_need
    ADD CONSTRAINT pupil_need_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.need(need_id) ON DELETE CASCADE;


--
-- Name: pupil_need pupil_need_pupil_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pupil_need
    ADD CONSTRAINT pupil_need_pupil_id_fkey FOREIGN KEY (pupil_id) REFERENCES public.pupil(pupil_id) ON DELETE CASCADE;


--
-- Name: TABLE category; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.category TO webuser;


--
-- Name: SEQUENCE category_category_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.category_category_id_seq TO webuser;


--
-- Name: TABLE device; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.device TO webuser;


--
-- Name: SEQUENCE device_device_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.device_device_id_seq TO webuser;


--
-- Name: TABLE form; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.form TO webuser;


--
-- Name: SEQUENCE form_form_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.form_form_id_seq TO webuser;


--
-- Name: TABLE need; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.need TO webuser;


--
-- Name: TABLE need_device; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.need_device TO webuser;


--
-- Name: SEQUENCE need_device_need_device_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.need_device_need_device_id_seq TO webuser;


--
-- Name: SEQUENCE need_need_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.need_need_id_seq TO webuser;


--
-- Name: TABLE pupil; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pupil TO webuser;


--
-- Name: TABLE pupil_device_alter; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pupil_device_alter TO webuser;


--
-- Name: SEQUENCE pupil_device_alter_pupil_device_alter_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.pupil_device_alter_pupil_device_alter_id_seq TO webuser;


--
-- Name: TABLE pupil_need; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pupil_need TO webuser;


--
-- Name: SEQUENCE pupil_need_pupil_need_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.pupil_need_pupil_need_id_seq TO webuser;


--
-- Name: SEQUENCE pupil_pupil_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.pupil_pupil_id_seq TO webuser;


--
-- PostgreSQL database dump complete
--

