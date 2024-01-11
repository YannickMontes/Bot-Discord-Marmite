import dotenv from "dotenv";

dotenv.config();

import client from "./Discord/client";
require('./Discord/lolEvents');
require('./Database/dbConnection');
require('./Discord/Handlers/eventHandler');
require('./Discord/Handlers/commandHandler');
require('./BanWords/banWords');