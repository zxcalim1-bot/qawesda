"""Parser for the knowledge-markdown content format used in content/**.md.

An entry starts with "# id: <id>" followed by "key: value" header lines, then body
sections that start with "## <heading>". Body blocks:
  * paragraphs (consecutive text lines),
  * bullet lists ("- item"),
  * fenced code: ```python (executed by the build, output captured), ```python norun,
    ```python error (must raise; exception type recorded), ```text, ```in / ```out (task data).
Header values may repeat (e.g. several "sample:" lines); they are collected into lists.
"""
import re

FENCE = re.compile(r"^```(\w*)\s*(\w*)\s*$")


class Entry:
    def __init__(self, entry_id, path, line):
        self.id = entry_id
        self.path = path
        self.line = line
        self.fields = {}
        self.sections = []  # list of (heading, [blocks])

    def get(self, key, default=None):
        v = self.fields.get(key)
        return v[0] if v else default

    def getall(self, key):
        return self.fields.get(key, [])

    def listval(self, key):
        out = []
        for v in self.getall(key):
            out.extend(x.strip() for x in re.split(r"[;,]", v) if x.strip())
        return out

    def section(self, name):
        for h, blocks in self.sections:
            if h.lower() == name.lower():
                return blocks
        return None

    def where(self):
        return "%s:%d (%s)" % (self.path, self.line, self.id)


def parse_file(path):
    text = open(path, encoding="utf-8").read()
    return parse_text(text, path)


def parse_text(text, path="<text>"):
    entries = []
    cur = None
    heading = None
    blocks = None
    para = []
    in_code = None
    code_lines = []
    lines = text.split("\n")

    def flush_para():
        nonlocal para
        if para and blocks is not None:
            items = [l for l in para]
            if all(l.lstrip().startswith("- ") for l in items):
                blocks.append({"ul": [l.lstrip()[2:].strip() for l in items]})
            else:
                # Mixed: paragraph lines followed by list lines
                buf, lst = [], []
                for l in items:
                    if l.lstrip().startswith("- "):
                        if buf:
                            blocks.append({"p": " ".join(x.strip() for x in buf)})
                            buf = []
                        lst.append(l.lstrip()[2:].strip())
                    else:
                        if lst:
                            blocks.append({"ul": lst})
                            lst = []
                        buf.append(l)
                if buf:
                    blocks.append({"p": " ".join(x.strip() for x in buf)})
                if lst:
                    blocks.append({"ul": lst})
        para = []

    for no, raw in enumerate(lines, 1):
        if in_code is not None:
            if raw.strip() == "```":
                lang, mode = in_code
                blocks.append({"code": "\n".join(code_lines).rstrip("\n") + "\n", "lang": lang, "mode": mode})
                in_code = None
                code_lines = []
            else:
                code_lines.append(raw)
            continue
        line = raw.rstrip()
        if line.startswith("# id:"):
            flush_para()
            cur = Entry(line[len("# id:"):].strip(), path, no)
            entries.append(cur)
            heading = None
            blocks = None
            continue
        if cur is None:
            continue
        if line.startswith("## "):
            flush_para()
            heading = line[3:].strip()
            blocks = []
            cur.sections.append((heading, blocks))
            continue
        m = FENCE.match(line.strip())
        if m and line.strip().startswith("```"):
            flush_para()
            if blocks is None:
                raise ValueError("%s:%d code block before any section in %s" % (path, no, cur.id))
            in_code = (m.group(1) or "text", m.group(2) or "")
            code_lines = []
            continue
        if heading is None:
            if not line.strip() or line.startswith("#"):
                continue
            if ":" not in line:
                raise ValueError("%s:%d header line without ':' in %s: %r" % (path, no, cur.id, line))
            k, v = line.split(":", 1)
            cur.fields.setdefault(k.strip(), []).append(v.strip())
            continue
        if not line.strip():
            flush_para()
            continue
        para.append(line)
    flush_para()
    if in_code is not None:
        raise ValueError("%s: unterminated code block in %s" % (path, cur.id if cur else "?"))
    return entries
