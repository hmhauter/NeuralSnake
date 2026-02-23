import { Route, Routes } from 'react-router-dom'
import Game from './game/Game.tsx'
/*
 * Only for toplevel routing for
 * Splashscreen
 * Login
 * Initial Password
 * Home
 */

const RoutingTable = (): React.ReactElement => (
    <Routes>
        <Route path="/game" element={<Game />} />
    </Routes>
);

RoutingTable.displayName = "RoutingTable";
export default RoutingTable;
