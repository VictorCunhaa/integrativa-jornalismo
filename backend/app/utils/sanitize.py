import nh3

ALLOWED_TAGS = {
    "p", "br", "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "blockquote",
    "a", "img", "strong", "em", "code", "pre",
    "figure", "figcaption", "div", "span",
    "iframe",
}

ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target", "rel"},
    "img": {"src", "alt", "title", "width", "height"},
    "iframe": {"src", "width", "height", "frameborder", "allow", "allowfullscreen"},
    "*": {"class"},
}


def sanitize_html(html: str) -> str:
    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        link_rel=None,
    )
