<script lang="ts">
  import { useTernent } from "../useTernent";

  const api = useTernent();
</script>

<section>
  <h2>Ternent integration panel</h2>
  <pre>{JSON.stringify(api.identity.getActiveIdentity(), null, 2)}</pre>
  <pre>{JSON.stringify(api.permissions.readableForViewer(), null, 2)}</pre>
  <pre>{JSON.stringify(api.tasks.visible(), null, 2)}</pre>
</section>
