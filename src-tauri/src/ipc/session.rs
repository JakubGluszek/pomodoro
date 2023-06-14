//! Tauri IPC commands to bridge the Session Backend Model Controllers with client side.

use tauri::{command, AppHandle};

use crate::{
    bmc::{GetSessionsOptions, SessionBmc},
    ctx::AppContext,
    models::{CreateSession, Session},
    prelude::Result,
};

#[command]
pub async fn create_session(app_handle: AppHandle, data: CreateSession) -> Result<i32> {
    app_handle.db(|mut db| SessionBmc::create(&mut db, &data))
}

#[command]
pub async fn get_session(app_handle: AppHandle, id: i32) -> Result<Session> {
    app_handle.db(|mut db| SessionBmc::get(&mut db, id))
}

#[command]
pub async fn get_sessions(
    app_handle: AppHandle,
    options: Option<GetSessionsOptions>,
) -> Result<Vec<Session>> {
    app_handle.db(|mut db| SessionBmc::get_list(&mut db, options))
}
