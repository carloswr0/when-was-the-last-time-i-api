import app from "./app.ts";
import ENVIRONTMENT from "./config/environment.config.ts";

if (!process.env.VERCEL) {
  const port = ENVIRONTMENT.PORT ?? 3000;
  app.listen(port, () => {
    console.log("Express server is running on port: ", port);
  });
}
