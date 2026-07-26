import { redirect } from "next/navigation";

// The pipeline walkthrough that used to live at /architecture now lives at
// /about with sharper copy and the scroll-progress/dot-nav polish - this
// route just forwards old links (footer, bookmarks) there instead of 404ing.
export default function ArchitecturePage() {
  redirect("/about");
}
