use std::net::{IpAddr, Ipv4Addr, Ipv6Addr, SocketAddr, ToSocketAddrs};
use std::path::PathBuf;
use std::time::Duration;

use tauri::Manager;
use tauri_plugin_http::reqwest;

const AI_CREDENTIAL_SERVICE: &str = "com.zili.writing.ai";
const AI_SETTINGS_ACCOUNT: &str = "settings-v1";
const MAX_WEB_RESEARCH_BODY_BYTES: usize = 2 * 1024 * 1024;
const WEB_RESEARCH_CONNECT_TIMEOUT: Duration = Duration::from_secs(10);
const WEB_RESEARCH_REQUEST_TIMEOUT: Duration = Duration::from_secs(20);
const QQ_CONTACT_URL: &str = "https://wpa.qq.com/msgrd?v=3&uin=13393167&site=qq&menu=yes";

#[tauri::command]
fn open_qq_contact() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", &format!("start \"\" \"{QQ_CONTACT_URL}\"")])
            .spawn()
            .map_err(|error| format!("无法打开 QQ 联系页面：{error}"))?;
        return Ok(());
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(QQ_CONTACT_URL)
            .spawn()
            .map_err(|error| format!("无法打开 QQ 联系页面：{error}"))?;
        return Ok(());
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(QQ_CONTACT_URL)
            .spawn()
            .map_err(|error| format!("无法打开 QQ 联系页面：{error}"))?;
        return Ok(());
    }
    #[allow(unreachable_code)]
    Err("当前系统不支持打开 QQ 联系页面".into())
}

fn is_blocked_ipv4(address: Ipv4Addr) -> bool {
    let [first, second, third, fourth] = address.octets();
    first == 0
        || first == 10
        || (first == 100 && (64..=127).contains(&second))
        || first == 127
        || (first == 169 && second == 254)
        || (first == 172 && (16..=31).contains(&second))
        || (first == 192 && second == 0 && third == 0)
        || (first == 192 && second == 0 && third == 2)
        || (first == 192 && second == 0 && third == 9)
        || (first == 192 && second == 0 && third == 10)
        || (first == 192 && second == 31 && third == 196)
        || (first == 192 && second == 52 && third == 193)
        || (first == 192 && second == 88 && third == 99)
        || (first == 192 && second == 168)
        || (first == 192 && second == 175 && third == 48)
        || (first == 198 && (18..=19).contains(&second))
        || (first == 198 && second == 51 && third == 100)
        || (first == 203 && second == 0 && third == 113)
        || first >= 224
        || (first == 255 && second == 255 && third == 255 && fourth == 255)
}

fn is_blocked_ipv6(address: Ipv6Addr) -> bool {
    let segments = address.segments();
    let is_ipv4_mapped = segments[..5].iter().all(|segment| *segment == 0) && segments[5] == 0xffff;
    let is_ipv4_compatible = segments[..6].iter().all(|segment| *segment == 0);

    address.is_unspecified()
    || address.is_loopback()
    || is_ipv4_mapped
    || is_ipv4_compatible
    || (segments[0] & 0xfe00) == 0xfc00 // 唯一本地地址（fc00::/7）
    || (segments[0] & 0xffc0) == 0xfe80 // 链路本地地址（fe80::/10）
    || (segments[0] & 0xffc0) == 0xfec0 // 已弃用的站点本地地址（fec0::/10）
    || (segments[0] & 0xff00) == 0xff00 // 多播地址（ff00::/8）
    || (segments[0] == 0x0100 && segments[1] == 0 && segments[2] == 0 && segments[3] == 0) // 仅丢弃地址（100::/64）
    || (segments[0] == 0x2001 && segments[1] == 0x0000) // Teredo 地址（2001::/32）
    || (segments[0] == 0x2001 && segments[1] == 0x0001) // 协议分配地址（2001:1::/32）
    || (segments[0] == 0x2001 && segments[1] == 0x0002 && segments[2] == 0) // IPv6 基准测试地址（2001:2::/48）
    || (segments[0] == 0x2001 && segments[1] == 0x0003) // AMT 地址（2001:3::/32）
    || (segments[0] == 0x2001 && segments[1] == 0x0004 && segments[2] == 0x0112) // AS112 地址（2001:4:112::/48）
    || (segments[0] == 0x2001 && segments[1] == 0x0db8) // 文档示例地址（2001:db8::/32）
    || (segments[0] == 0x2001 && (segments[1] & 0xfff0) == 0x0010) // ORCHID 地址（2001:10::/28）
    || (segments[0] == 0x2001 && (0x0020..=0x003f).contains(&segments[1])) // 保留的协议分配地址（2001:20::/28 至 2001:3f::/28）
    || (segments[0] == 0x3fff && segments[1] < 0x1000) // 文档示例地址（3fff::/20）
    || (segments[0] == 0x2002) // 已弃用的 6to4 地址（2002::/16）
    || (segments[0] == 0x0064 && segments[1] == 0xff9b && segments[2] == 1) // NAT64 保留地址（64:ff9b:1::/48）
    || (segments[0] == 0x5f00) // SRv6 SID 保留地址（5f00::/16）
}

fn is_blocked_ip(address: IpAddr) -> bool {
    match address {
        IpAddr::V4(address) => is_blocked_ipv4(address),
        IpAddr::V6(address) => is_blocked_ipv6(address),
    }
}

fn parse_web_research_url(value: &str) -> Result<(reqwest::Url, String), String> {
    let url = reqwest::Url::parse(value).map_err(|_| "网页地址格式无效".to_string())?;
    if url.scheme() != "https" {
        return Err("网页地址必须使用 HTTPS".into());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("网页地址不能包含凭据".into());
    }
    if url.port_or_known_default() != Some(443) {
        return Err("网页地址必须使用默认 443 端口".into());
    }
    let raw_host = url
        .host_str()
        .ok_or_else(|| "网页地址缺少主机名".to_string())?
        .to_ascii_lowercase();
    // `url::Url::host_str()` 会给 IPv6 字面量保留方括号。URL 本身继续用于
    // Host/SNI；IP 解析和 DNS 固定解析则使用去掉方括号的主机名。
    let host = raw_host
        .strip_prefix('[')
        .and_then(|value| value.strip_suffix(']'))
        .unwrap_or(&raw_host)
        .to_string();
    if host.is_empty() || host.ends_with("..") {
        return Err("网页地址主机名无效".into());
    }
    let normalized_host = host.trim_end_matches('.');
    if normalized_host.is_empty()
        || normalized_host == "localhost"
        || normalized_host == "local"
        || normalized_host == "localdomain"
        || normalized_host.ends_with(".localhost")
        || normalized_host.ends_with(".local")
        || normalized_host.ends_with(".home.arpa")
    {
        return Err("网页地址主机名不允许访问".into());
    }
    Ok((url, host))
}

fn select_public_address(addresses: &[SocketAddr]) -> Result<SocketAddr, String> {
    if addresses.is_empty() {
        return Err("网页地址没有可用的 DNS 解析结果".into());
    }
    if addresses.iter().any(|address| is_blocked_ip(address.ip())) {
        return Err("网页地址解析到了非公网地址".into());
    }
    addresses
        .first()
        .copied()
        .ok_or_else(|| "网页地址没有可用的公网地址".into())
}

async fn read_web_research_body(mut response: reqwest::Response) -> Result<String, String> {
    if let Some(length) = response.content_length() {
        if length > MAX_WEB_RESEARCH_BODY_BYTES as u64 {
            return Err("网页响应内容过大".into());
        }
    }

    let mut body = Vec::new();
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| "读取网页响应失败".to_string())?
    {
        if body.len().saturating_add(chunk.len()) > MAX_WEB_RESEARCH_BODY_BYTES {
            return Err("网页响应内容过大".into());
        }
        body.extend_from_slice(&chunk);
    }
    Ok(String::from_utf8_lossy(&body).into_owned())
}

#[tauri::command]
async fn fetch_web_research_text(url: String) -> Result<String, String> {
    let (url, host) = parse_web_research_url(&url)?;
    let addresses = if let Ok(address) = host.parse::<IpAddr>() {
        vec![SocketAddr::new(address, 443)]
    } else {
        (host.as_str(), 443)
            .to_socket_addrs()
            .map_err(|_| "网页地址 DNS 解析失败".to_string())?
            .collect::<Vec<_>>()
    };
    let selected_address = select_public_address(&addresses)?;

    let mut client_builder = reqwest::Client::builder()
        .connect_timeout(WEB_RESEARCH_CONNECT_TIMEOUT)
        .timeout(WEB_RESEARCH_REQUEST_TIMEOUT)
        .no_proxy()
        .redirect(reqwest::redirect::Policy::none())
        .user_agent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        );
    if host.parse::<IpAddr>().is_err() {
        client_builder = client_builder.resolve(&host, selected_address);
    }
    let client = client_builder
        .build()
        .map_err(|_| "网页请求客户端初始化失败".to_string())?;
    let response = client
        .get(url)
        .header(reqwest::header::ACCEPT, "text/html,application/xhtml+xml")
        .header(reqwest::header::ACCEPT_LANGUAGE, "zh-CN,zh;q=0.9,en;q=0.6")
        .send()
        .await
        .map_err(|_| "网页请求失败".to_string())?;
    if !response.status().is_success() {
        return Err(format!("网页请求失败（{}）", response.status().as_u16()));
    }
    read_web_research_body(response).await
}

#[cfg(test)]
mod web_research_tests {
    use super::*;

    #[test]
    fn validates_web_research_urls() {
        assert!(parse_web_research_url("https://example.com/path").is_ok());
        assert!(parse_web_research_url("https://example.com:443/path").is_ok());
        let (_, ipv6_host) = parse_web_research_url("https://[2606:4700:4700::1111]/path")
            .expect("public IPv6 URL should be accepted");
        assert_eq!(ipv6_host, "2606:4700:4700::1111");
        assert!(parse_web_research_url("http://example.com/path").is_err());
        assert!(parse_web_research_url("https://example.com:8443/path").is_err());
        assert!(parse_web_research_url("https://user@example.com/path").is_err());
        assert!(parse_web_research_url("https://localhost/path").is_err());
        assert!(parse_web_research_url("https://example.local../path").is_err());
    }

    #[test]
    fn rejects_non_public_ipv4_and_ipv6_addresses() {
        for value in [
            "0.0.0.0",
            "10.0.0.1",
            "100.64.0.1",
            "127.0.0.1",
            "169.254.1.1",
            "172.16.0.1",
            "192.0.2.1",
            "192.168.1.1",
            "198.18.0.1",
            "198.51.100.1",
            "203.0.113.1",
            "224.0.0.1",
            "255.255.255.255",
            "::",
            "::1",
            "::ffff:192.168.1.1",
            "fc00::1",
            "fe80::1",
            "ff02::1",
            "2001:db8::1",
            "2001:1::1",
            "2001:3::1",
            "2001:4:112::1",
            "2001:1f::1",
            "3fff::1",
        ] {
            let address = value.parse::<IpAddr>().expect(value);
            assert!(is_blocked_ip(address), "expected {value} to be blocked");
        }
        assert!(!is_blocked_ip("1.1.1.1".parse().unwrap()));
        assert!(!is_blocked_ip("2606:4700:4700::1111".parse().unwrap()));
    }

    #[test]
    fn rejects_a_mixed_dns_answer_set() {
        let addresses = [
            SocketAddr::new("93.184.216.34".parse().unwrap(), 443),
            SocketAddr::new("192.168.1.10".parse().unwrap(), 443),
        ];
        assert!(select_public_address(&addresses).is_err());

        let public_addresses = [
            SocketAddr::new("93.184.216.34".parse().unwrap(), 443),
            SocketAddr::new("2606:4700:4700::1111".parse().unwrap(), 443),
        ];
        assert_eq!(
            select_public_address(&public_addresses).unwrap(),
            public_addresses[0]
        );
    }
}

fn ai_settings_entry() -> Result<keyring::Entry, String> {
    keyring::Entry::new(AI_CREDENTIAL_SERVICE, AI_SETTINGS_ACCOUNT)
        .map_err(|error| error.to_string())
}

fn ai_credential_entry(provider_id: &str, base_url: &str) -> Result<keyring::Entry, String> {
    let provider = provider_id.trim();
    let endpoint = base_url.trim().trim_end_matches('/').to_ascii_lowercase();
    if !matches!(provider, "agnes" | "openai-compatible") {
        return Err("unsupported AI provider".into());
    }
    if endpoint.is_empty()
        || endpoint.len() > 1000
        || (!endpoint.starts_with("http://") && !endpoint.starts_with("https://"))
    {
        return Err("invalid AI endpoint".into());
    }
    keyring::Entry::new(AI_CREDENTIAL_SERVICE, &format!("{provider}|{endpoint}"))
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_ai_api_key(provider_id: String, base_url: String, api_key: String) -> Result<(), String> {
    let secret = api_key.trim();
    if secret.is_empty() || secret.len() > 64 * 1024 {
        return Err("invalid API key length".into());
    }
    ai_credential_entry(&provider_id, &base_url)?
        .set_password(secret)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn load_ai_api_key(provider_id: String, base_url: String) -> Result<Option<String>, String> {
    match ai_credential_entry(&provider_id, &base_url)?.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

#[tauri::command]
fn delete_ai_api_key(provider_id: String, base_url: String) -> Result<(), String> {
    match ai_credential_entry(&provider_id, &base_url)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(error) => Err(error.to_string()),
    }
}

#[tauri::command]
fn save_ai_settings(settings_json: String) -> Result<(), String> {
    if settings_json.is_empty() || settings_json.len() > 16 * 1024 {
        return Err("invalid AI settings length".into());
    }
    let settings: serde_json::Value =
        serde_json::from_str(&settings_json).map_err(|_| "invalid AI settings JSON".to_string())?;
    if !settings.is_object() {
        return Err("AI settings must be a JSON object".into());
    }
    ai_settings_entry()?
        .set_password(&settings_json)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn load_ai_settings() -> Result<Option<String>, String> {
    match ai_settings_entry()?.get_password() {
        Ok(settings) => Ok(Some(settings)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

#[cfg(test)]
mod credential_tests {
    use super::{delete_ai_api_key, load_ai_api_key, save_ai_api_key};

    #[test]
    fn api_key_round_trip_uses_system_credential_store() {
        let provider = "openai-compatible".to_string();
        let endpoint = format!("https://credential-test-{}.invalid/v1/", std::process::id());
        let normalized_endpoint = endpoint.trim_end_matches('/').to_ascii_uppercase();
        let secret = format!("temporary-test-key-{}", std::process::id());

        delete_ai_api_key(provider.clone(), endpoint.clone()).expect("clean stale test credential");
        save_ai_api_key(provider.clone(), endpoint.clone(), secret.clone())
            .expect("save credential");
        assert_eq!(
            load_ai_api_key(provider.clone(), normalized_endpoint).expect("load credential"),
            Some(secret)
        );
        delete_ai_api_key(provider.clone(), endpoint.clone()).expect("delete credential");
        assert_eq!(
            load_ai_api_key(provider, endpoint).expect("verify deletion"),
            None
        );
    }
}

fn image_extension(extension: &str) -> Result<&str, String> {
    match extension.to_ascii_lowercase().as_str() {
        "png" => Ok("png"),
        "jpg" | "jpeg" => Ok("jpg"),
        "webp" => Ok("webp"),
        "gif" => Ok("gif"),
        _ => Err("unsupported image format".into()),
    }
}

fn attachment_extension(extension: &str) -> Result<String, String> {
    let normalized = extension.to_ascii_lowercase();
    let allowed = ["pdf", "docx", "txt", "md", "json", "epub", "csv", "rtf"];
    if allowed.contains(&normalized.as_str()) {
        Ok(normalized)
    } else {
        Err("unsupported attachment format".into())
    }
}

fn reference_extension(extension: &str) -> Result<String, String> {
    let normalized = extension.to_ascii_lowercase();
    let allowed = ["txt", "md", "docx", "epub"];
    if allowed.contains(&normalized.as_str()) {
        Ok(normalized)
    } else {
        Err("unsupported reference text format".into())
    }
}

fn storage_id<'a>(value: &'a str, field: &str) -> Result<&'a str, String> {
    if value.is_empty()
        || value.len() > 128
        || !value
            .bytes()
            .all(|byte| matches!(byte, b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_'))
    {
        return Err(format!("invalid {field}"));
    }
    Ok(value)
}

fn storage_path(
    app: &tauri::AppHandle,
    collection: &str,
    project_id: &str,
    object_id: &str,
    extension: &str,
) -> Result<PathBuf, String> {
    let project_id = storage_id(project_id, "project id")?;
    let object_id = storage_id(object_id, "object id")?;
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    let collection_dir = app_data_dir.join(collection);
    let project_dir = collection_dir.join(project_id);
    let path = project_dir.join(format!("{object_id}.{extension}"));
    if !project_dir.starts_with(&collection_dir) || !path.starts_with(&project_dir) {
        return Err("invalid storage path".into());
    }
    Ok(path)
}

#[tauri::command]
fn save_image_asset(
    app: tauri::AppHandle,
    project_id: String,
    asset_id: String,
    extension: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let extension = image_extension(&extension)?;
    if bytes.is_empty() || bytes.len() > 20 * 1024 * 1024 {
        return Err("image size must be between 1 byte and 20 MB".into());
    }
    let path = storage_path(&app, "assets", &project_id, &asset_id, extension)?;
    let directory = path
        .parent()
        .ok_or_else(|| "invalid storage path".to_string())?;
    std::fs::create_dir_all(directory).map_err(|error| error.to_string())?;
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn delete_image_asset(
    app: tauri::AppHandle,
    project_id: String,
    asset_id: String,
    extension: String,
) -> Result<(), String> {
    let extension = image_extension(&extension)?;
    let path = storage_path(&app, "assets", &project_id, &asset_id, extension)?;
    if path.exists() {
        std::fs::remove_file(path).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn read_image_asset(
    app: tauri::AppHandle,
    project_id: String,
    asset_id: String,
    extension: String,
) -> Result<Vec<u8>, String> {
    let extension = image_extension(&extension)?;
    let path = storage_path(&app, "assets", &project_id, &asset_id, extension)?;
    std::fs::read(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_attachment(
    app: tauri::AppHandle,
    project_id: String,
    attachment_id: String,
    extension: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let extension = attachment_extension(&extension)?;
    if bytes.is_empty() || bytes.len() > 50 * 1024 * 1024 {
        return Err("attachment size must be between 1 byte and 50 MB".into());
    }
    let path = storage_path(&app, "attachments", &project_id, &attachment_id, &extension)?;
    let directory = path
        .parent()
        .ok_or_else(|| "invalid storage path".to_string())?;
    std::fs::create_dir_all(directory).map_err(|error| error.to_string())?;
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn delete_attachment(
    app: tauri::AppHandle,
    project_id: String,
    attachment_id: String,
    extension: String,
) -> Result<(), String> {
    let extension = attachment_extension(&extension)?;
    let path = storage_path(&app, "attachments", &project_id, &attachment_id, &extension)?;
    if path.exists() {
        std::fs::remove_file(path).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn read_attachment(
    app: tauri::AppHandle,
    project_id: String,
    attachment_id: String,
    extension: String,
) -> Result<Vec<u8>, String> {
    let extension = attachment_extension(&extension)?;
    let path = storage_path(&app, "attachments", &project_id, &attachment_id, &extension)?;
    std::fs::read(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_reference_text(
    app: tauri::AppHandle,
    project_id: String,
    reference_id: String,
    extension: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let extension = reference_extension(&extension)?;
    if bytes.is_empty() || bytes.len() > 50 * 1024 * 1024 {
        return Err("reference text size must be between 1 byte and 50 MB".into());
    }
    let path = storage_path(&app, "references", &project_id, &reference_id, &extension)?;
    let directory = path
        .parent()
        .ok_or_else(|| "invalid storage path".to_string())?;
    std::fs::create_dir_all(directory).map_err(|error| error.to_string())?;
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn delete_reference_text(
    app: tauri::AppHandle,
    project_id: String,
    reference_id: String,
    extension: String,
) -> Result<(), String> {
    let extension = reference_extension(&extension)?;
    let path = storage_path(&app, "references", &project_id, &reference_id, &extension)?;
    if path.exists() {
        std::fs::remove_file(path).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn read_reference_text(
    app: tauri::AppHandle,
    project_id: String,
    reference_id: String,
    extension: String,
) -> Result<Vec<u8>, String> {
    let extension = reference_extension(&extension)?;
    let path = storage_path(&app, "references", &project_id, &reference_id, &extension)?;
    std::fs::read(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_project_backup(
    directory: String,
    file_name: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let directory = directory.trim();
    if directory.is_empty() {
        return Err("save directory is empty".into());
    }
    if bytes.is_empty() || bytes.len() > 500 * 1024 * 1024 {
        return Err("backup size must be between 1 byte and 500 MB".into());
    }
    let name = std::path::Path::new(file_name.trim())
        .file_name()
        .and_then(|value| value.to_str())
        .filter(|value| !value.is_empty() && value.to_ascii_lowercase().ends_with(".zili"))
        .ok_or_else(|| "invalid backup file name".to_string())?;
    let safe_name: String = name
        .chars()
        .map(|character| {
            if character.is_control()
                || matches!(
                    character,
                    '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*'
                )
            {
                '_'
            } else {
                character
            }
        })
        .collect();
    let path = std::path::Path::new(directory).join(safe_name);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri_plugin_sql::{Migration, MigrationKind};

    let migrations = vec![
        Migration {
            version: 1,
            description: "create_projects_and_chapters",
            sql: r#"
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        active_chapter_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_chapters_project_order
        ON chapters(project_id, sort_order);
    "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_volumes_and_revisions",
            sql: r#"
        CREATE TABLE IF NOT EXISTS volumes (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        ALTER TABLE chapters ADD COLUMN volume_id TEXT;
        INSERT INTO volumes (id, project_id, title, sort_order, created_at)
          SELECT id || '-default-volume', id, '第一卷', 0, updated_at FROM projects;
        UPDATE chapters
          SET volume_id = project_id || '-default-volume'
          WHERE volume_id IS NULL;
        CREATE INDEX IF NOT EXISTS idx_volumes_project_order
          ON volumes(project_id, sort_order);
        CREATE TABLE IF NOT EXISTS revisions (
          id TEXT PRIMARY KEY NOT NULL,
          chapter_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          reason TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_revisions_chapter_created
          ON revisions(chapter_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_deleted_chapters",
            sql: r#"
        CREATE TABLE IF NOT EXISTS deleted_chapters (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          original_volume_id TEXT NOT NULL,
          volume_title TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          deleted_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_deleted_chapters_project_time
          ON deleted_chapters(project_id, deleted_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_project_assets",
            sql: r#"
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          extension TEXT NOT NULL,
          media_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          local_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_assets_project_created
          ON assets(project_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add_project_attachments",
            sql: r#"
        CREATE TABLE IF NOT EXISTS attachments (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          extension TEXT NOT NULL,
          media_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          local_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_attachments_project_created
          ON attachments(project_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "add_attachment_scope",
            sql: r#"
        ALTER TABLE attachments ADD COLUMN scope_type TEXT NOT NULL DEFAULT 'project';
        ALTER TABLE attachments ADD COLUMN scope_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_attachments_project_scope
          ON attachments(project_id, scope_type, scope_id);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "add_scenes",
            sql: r#"
        ALTER TABLE projects ADD COLUMN active_scene_id TEXT;
        CREATE TABLE IF NOT EXISTS scenes (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          title TEXT NOT NULL,
          goal TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        INSERT INTO scenes (id, project_id, chapter_id, title, goal, notes, sort_order, updated_at)
          SELECT id || '-default-scene', project_id, id, '场景 1', '', '', 0, updated_at
          FROM chapters;
        UPDATE projects
          SET active_scene_id = active_chapter_id || '-default-scene'
          WHERE active_scene_id IS NULL;
        CREATE INDEX IF NOT EXISTS idx_scenes_project_chapter_order
          ON scenes(project_id, chapter_id, sort_order);
        ALTER TABLE deleted_chapters ADD COLUMN scenes_json TEXT NOT NULL DEFAULT '[]';
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "add_structured_chapter_content",
            sql: r#"
        ALTER TABLE chapters ADD COLUMN content_json TEXT NOT NULL DEFAULT '';
        ALTER TABLE chapters ADD COLUMN plain_text TEXT NOT NULL DEFAULT '';
        ALTER TABLE chapters ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE chapters ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "add_reference_texts",
            sql: r#"
        CREATE TABLE IF NOT EXISTS reference_texts (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          extension TEXT NOT NULL,
          media_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          local_path TEXT NOT NULL,
          rights_confirmed_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_reference_texts_project_created
          ON reference_texts(project_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "add_project_soft_delete",
            sql: r#"
        ALTER TABLE projects ADD COLUMN deleted_at INTEGER;
        CREATE INDEX IF NOT EXISTS idx_projects_deleted_updated
          ON projects(deleted_at, updated_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "add_structured_deleted_content_and_revisions",
            sql: r#"
        ALTER TABLE deleted_chapters ADD COLUMN content_json TEXT NOT NULL DEFAULT '';
        ALTER TABLE deleted_chapters ADD COLUMN plain_text TEXT NOT NULL DEFAULT '';
        ALTER TABLE deleted_chapters ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE deleted_chapters ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
        ALTER TABLE revisions ADD COLUMN content_json TEXT NOT NULL DEFAULT '';
        ALTER TABLE revisions ADD COLUMN plain_text TEXT NOT NULL DEFAULT '';
        ALTER TABLE revisions ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE revisions ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "add_story_memory",
            sql: r#"
        CREATE TABLE IF NOT EXISTS chapter_memories (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          summary TEXT NOT NULL,
          revision_number INTEGER NOT NULL,
          content_hash TEXT NOT NULL,
          analyzed_at INTEGER NOT NULL,
          UNIQUE(project_id, chapter_id),
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_chapter_memories_project
          ON chapter_memories(project_id, analyzed_at DESC);
        CREATE TABLE IF NOT EXISTS story_memory_candidates (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'candidate',
          confidence REAL NOT NULL DEFAULT 0,
          evidence_node_id TEXT NOT NULL,
          evidence_quote TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_story_memory_candidates_project_status
          ON story_memory_candidates(project_id, status, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_story_memory_candidates_chapter
          ON story_memory_candidates(chapter_id, created_at ASC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 13,
            description: "add_creative_advisor",
            sql: r#"
        CREATE TABLE IF NOT EXISTS creative_briefs (
          project_id TEXT PRIMARY KEY NOT NULL,
          premise TEXT NOT NULL DEFAULT '',
          genre TEXT NOT NULL DEFAULT '',
          core_experience TEXT NOT NULL DEFAULT '',
          theme TEXT NOT NULL DEFAULT '',
          protagonist_desire TEXT NOT NULL DEFAULT '',
          stakes TEXT NOT NULL DEFAULT '',
          central_conflict TEXT NOT NULL DEFAULT '',
          length_target TEXT NOT NULL DEFAULT '',
          ending_tendency TEXT NOT NULL DEFAULT '',
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS outline_nodes (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          parent_id TEXT,
          level TEXT NOT NULL,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          locked INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT 'author',
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_outline_nodes_project_level
          ON outline_nodes(project_id, level, sort_order ASC);
        CREATE TABLE IF NOT EXISTS advisor_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          scene_id TEXT,
          situation TEXT NOT NULL,
          obstacle TEXT NOT NULL,
          directions_json TEXT NOT NULL,
          user_note TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_advisor_sessions_project_created
          ON advisor_sessions(project_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 14,
            description: "add_ai_text_candidates",
            sql: r#"
        CREATE TABLE IF NOT EXISTS ai_text_candidates (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          mode TEXT NOT NULL,
          title TEXT NOT NULL,
          text TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'candidate',
          anchor_from INTEGER NOT NULL,
          anchor_to INTEGER NOT NULL,
          source_text TEXT NOT NULL DEFAULT '',
          task_json TEXT NOT NULL,
          validation_json TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_ai_text_candidates_chapter_created
          ON ai_text_candidates(chapter_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 15,
            description: "add_review_issues",
            sql: r#"
        CREATE TABLE IF NOT EXISTS review_issues (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT,
          category TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          source TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          suggestion TEXT NOT NULL DEFAULT '',
          evidence_json TEXT NOT NULL,
          content_hash TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_review_issues_project_status
          ON review_issues(project_id, status, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_review_issues_chapter
          ON review_issues(chapter_id, updated_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 16,
            description: "add_style_profiles",
            sql: r#"
        CREATE TABLE IF NOT EXISTS style_profiles (
          project_id TEXT PRIMARY KEY NOT NULL,
          profile_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 17,
            description: "add_ai_usage_logs",
            sql: r#"
        CREATE TABLE IF NOT EXISTS ai_usage_logs (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT,
          task_type TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          model TEXT NOT NULL,
          prompt_tokens INTEGER,
          completion_tokens INTEGER,
          latency_ms INTEGER NOT NULL,
          success INTEGER NOT NULL,
          error_code INTEGER,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_project_created
          ON ai_usage_logs(project_id, created_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "add_ai_conversations",
            sql: r#"
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          chapter_id TEXT,
          scene_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          UNIQUE(project_id, kind),
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_project_updated
          ON ai_conversations(project_id, updated_at DESC);
        CREATE TABLE IF NOT EXISTS ai_conversation_messages (
          id TEXT PRIMARY KEY NOT NULL,
          conversation_id TEXT NOT NULL,
          request_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL DEFAULT '',
          payload_json TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL,
          error TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_conversation_created
          ON ai_conversation_messages(conversation_id, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_request
          ON ai_conversation_messages(request_id);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 19,
            description: "add_advanced_ai_tools",
            sql: r#"
        CREATE TABLE IF NOT EXISTS advanced_ai_records (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          chapter_id TEXT,
          scene_id TEXT,
          title TEXT NOT NULL,
          input_json TEXT NOT NULL,
          output_json TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_advanced_ai_records_project_kind
          ON advanced_ai_records(project_id, kind, updated_at DESC);
        CREATE TABLE IF NOT EXISTS research_source_cards (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL DEFAULT '',
          excerpt TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          verified INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_research_source_cards_project_updated
          ON research_source_cards(project_id, updated_at DESC);
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 20,
            description: "add_story_memory_metadata",
            sql: r#"
        ALTER TABLE story_memory_candidates ADD COLUMN metadata_json TEXT NOT NULL DEFAULT '{}';
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 21,
            description: "add_ai_usage_prompt_version",
            sql: r#"
        ALTER TABLE ai_usage_logs ADD COLUMN prompt_version TEXT NOT NULL DEFAULT '';
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 22,
            description: "add_scene_document_anchors",
            sql: r#"
        ALTER TABLE scenes ADD COLUMN summary TEXT NOT NULL DEFAULT '';
        ALTER TABLE scenes ADD COLUMN start_node_id TEXT NOT NULL DEFAULT '';
        ALTER TABLE scenes ADD COLUMN end_node_id TEXT NOT NULL DEFAULT '';
      "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 23,
            description: "allow_multiple_ai_conversations",
            sql: r#"
        CREATE TABLE ai_conversations_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          chapter_id TEXT,
          scene_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        INSERT INTO ai_conversations_v2
          SELECT id, project_id, kind, title, chapter_id, scene_id, created_at, updated_at FROM ai_conversations;
        CREATE TABLE ai_conversation_messages_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          conversation_id TEXT NOT NULL,
          request_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL DEFAULT '',
          payload_json TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL,
          error TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES ai_conversations_v2(id) ON DELETE CASCADE
        );
        INSERT INTO ai_conversation_messages_v2
          SELECT id, conversation_id, request_id, role, content, payload_json, status, error, created_at FROM ai_conversation_messages;
        DROP TABLE ai_conversation_messages;
        DROP TABLE ai_conversations;
        ALTER TABLE ai_conversations_v2 RENAME TO ai_conversations;
        ALTER TABLE ai_conversation_messages_v2 RENAME TO ai_conversation_messages;
        CREATE INDEX idx_ai_conversations_project_updated
          ON ai_conversations(project_id, updated_at DESC);
        CREATE INDEX idx_ai_conversation_messages_conversation_created
          ON ai_conversation_messages(conversation_id, created_at ASC);
        CREATE INDEX idx_ai_conversation_messages_request
          ON ai_conversation_messages(request_id);
      "#,
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            open_qq_contact,
            save_image_asset,
            delete_image_asset,
            read_image_asset,
            save_attachment,
            delete_attachment,
            read_attachment,
            save_reference_text,
            delete_reference_text,
            read_reference_text,
            save_ai_api_key,
            load_ai_api_key,
            delete_ai_api_key,
            save_ai_settings,
            load_ai_settings,
            save_project_backup,
            fetch_web_research_text,
        ])
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:zili.db", migrations)
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
