import { finishedLine, firstTryLine } from "../src/lib/streak";

export function shareQuizResult() {
  return {
    line: "",
    count: 0,
    status: "",
    first: 0,
    total: 0,
    share(
      count: number,
      siteName: string,
      url: string,
      first?: number,
      total?: number,
    ) {
      const score =
        typeof first === "number" && typeof total === "number" && total > 0
          ? ` ${firstTryLine(first, total)}`
          : "";
      const text = finishedLine(count, siteName) + score;
      const body = url ? `${text}\n${url}` : text;
      const nav = globalThis.navigator;
      const finish = (result: string) => {
        this.status = result;
        return result;
      };
      if (nav?.share) {
        return nav.share({ text: body }).then(
          () => finish("shared"),
          () => finish(""),
        );
      }
      if (nav?.clipboard?.writeText) {
        return nav.clipboard.writeText(body).then(
          () => finish("copied"),
          () => finish(""),
        );
      }
      return Promise.resolve(finish(""));
    },
  };
}

export function shareQuizResultClientScript() {
  return `document.addEventListener("alpine:init", function () {
  Alpine.data("shareQuizResult", ${shareQuizResult.toString()});
});
`;
}
