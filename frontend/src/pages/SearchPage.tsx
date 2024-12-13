import { Button } from "@yamada-ui/react";
import { useState } from "react";
import { SearchContainer } from "../component/search/SearchContainer";
import { UpsertContainer } from "../component/search/UpsertContainer";

export default function SearchPage() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginInline: "2vw" }}>
      <SearchContainer />
      <Button onClick={() => setOpen(true)}>追加</Button>
      <UpsertContainer
        open={open}
        close={() => setOpen(false)}
        submit={() => setOpen(false)}
      />
    </div>
  );
}
