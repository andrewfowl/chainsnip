import { initBotId } from "botid/client/core"

// Server actions POST to the page that invokes them, so protecting the signup page covers signUp().
initBotId({
  protect: [{ path: "/auth/signup", method: "POST" }],
})
