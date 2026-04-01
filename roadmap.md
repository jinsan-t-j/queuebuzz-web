# QueueBuzz Roadmap

## Next Steps
- [ ] Implement "Service Finished" button on `CalledView` after arrival confirmation.
- [ ] Add confirmation modal for user-initiated service completion.

## Future Enhancements
- [ ] **Soft-Serve Logic:** Automatically mark the previous guest as `SERVED` (or `FINISHED`) when the host calls the next person in a single-lane queue. This prevents inactive SSE sessions from staying open.
- [ ] **Dynamic Rating Prompt:** Ask for feedback based on wait-time experience vs business service.
- [ ] **Queue Recovery:** Allow guests to recover a session if they accidentally closed their browser but haven't been served yet.
