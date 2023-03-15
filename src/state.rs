use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use secret_toolkit::storage::{Item, Keymap};

pub static CONFIG_KEY: &[u8] = b"config";

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct Card {
    pub name: String,
    pub address: String,
    pub phone: String,
}

pub static USER_CARDS: Keymap<u8, Card> = Keymap::new(b"user cards");

pub static CARD_VIEWING_KEY: Keymap<String, bool> = Keymap::new(b"card viewing key");

pub static ENTROPY: Item<String> = Item::new(b"entropy");
