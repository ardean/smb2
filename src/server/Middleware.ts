import Request from "./Request";
import Response from "./Response";

type Middleware = (req: Request, res: Response) => void | Promise<void>;
export default Middleware;