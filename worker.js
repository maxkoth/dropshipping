export default {
  async fetch(request, env) {
    // Serve the static store bundle (local-store/) for every request.
    return env.ASSETS.fetch(request);
  },
};
