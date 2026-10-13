export const links = {
  github: "https://github.com/m-alan08",
  xHandle: "",
  email: "",
  resumeFile: "",
};

export function localPath(path = ""): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
