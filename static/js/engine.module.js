// js/engine.module.js

import { GameSettings } from './engine/game.settings.js';
import { GameStateFactory } from './engine/game.state.js';
import { GameHelpers } from './engine/game.helpers.js';
import { GameInput } from './engine/game.input.js';
import { GameView } from './engine/game.view.js';
import { GameUpdate } from './engine/game.update.js';
import { GameLoop } from './engine/game.loop.js';
import { GameBridge } from './engine/game.bridge.js';
import { GameEngine } from './game.engine.js';
import { API } from './api.js';
import './game.page.js'; // 여기서 setGameOverHandler 등록

window.addEventListener('DOMContentLoaded', () => GameEngine.init());