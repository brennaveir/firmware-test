use axum::{
    body::StreamBody,
    http::header,
    response::{Html, IntoResponse},
    routing::get,
    Router, extract::Query,
};
use http::Method;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tokio_util::io::ReaderStream;

#[derive(serde::Deserialize)]
pub struct Params {
    f: String
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "firmware_test=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET])
        // allow requests from any origin
        .allow_origin(Any);
    let app = Router::new()
        .route("/index", get(firmware_page))
        .route("/scripts/main.js", get(get_main_js))
        .route("/styles/main.css", get(get_main_css))
        .route("/cgi-bin/param.cgi", get(get_cgi_param))
        .layer(cors.clone())
        .layer(TraceLayer::new_for_http());
    tracing::info!("Starting server...");
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}


pub async fn get_main_js() -> impl IntoResponse {
    let main_js = include_str!("../public/scripts/main.js");
    let stream = ReaderStream::new(main_js.as_bytes());
    let body = StreamBody::new(stream);
    let headers = [
        (
            header::CONTENT_TYPE,
            "application/javascript; charset=utf-8",
        ),
        (
            header::CACHE_CONTROL,
            "public, max-age=31536000, immutable, filename=main.js",
        ),
    ];
    (headers, body)
}

pub async fn get_main_css() -> impl IntoResponse {
    let main_css = include_str!("../public/styles/main.css");
    let stream = ReaderStream::new(main_css.as_bytes());
    let body = StreamBody::new(stream);
    let headers = [
        (header::CONTENT_TYPE, "text/css; charset=utf-8"),
        (
            header::CACHE_CONTROL,
            "public, max-age=31536000, immutable, filename=main.css",
        ),
    ];
    (headers, body)
}

pub async fn firmware_page() -> Html<&'static str> {
    let dashboard = include_str!("../public/index.html");
    Html(dashboard)
}

pub async fn get_cgi_param(
    param: Query<Params>
) -> String {
    if param.f == "get_device_conf".to_string() {
        let device_conf = include_str!("../get_device_conf.txt");
        device_conf.to_string()
    } else {
        "Not found".to_string()
    }
}
