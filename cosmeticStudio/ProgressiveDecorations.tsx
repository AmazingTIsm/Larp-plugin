import ErrorBoundary from "@components/ErrorBoundary";
import { Button } from "@components/Button";
import { useIntersection } from "@utils/react";
import { useEffect, useRef, useState } from "@webpack/common";
import type { ReactNode } from "react";

const PAGE_SIZE = 16;
const MoreOnScroll = ErrorBoundary.wrap(function MoreOnScroll({ onReveal }: { onReveal: () => void; }) {
    const [ref, visible] = useIntersection(true);
    const fired = useRef(false);
    useEffect(() => {
        if (visible && !fired.current) { fired.current = true; onReveal(); }
    }, [visible, onReveal]);
    return <div ref={ref} style={{ height: 1 }} aria-hidden="true" />;
}, { noop: true });

interface DecorationItem {skuId:string;name:string;previewUrl:string;asset?:string;}
export const ProgressiveDecorations = ErrorBoundary.wrap(function ProgressiveDecorations({ items, children, onPage }: {
    items: DecorationItem[];
    children: (visible: DecorationItem[]) => ReactNode;
    onPage?: (visible: DecorationItem[]) => void;
}) {
    const [count, setCount] = useState(PAGE_SIZE);
    const visible = items.slice(0, count);
    const onPageRef = useRef(onPage);
    onPageRef.current = onPage;
    useEffect(() => { onPageRef.current?.(items.slice(Math.max(0, count - PAGE_SIZE), count)); }, [count, items]);
    const more = count < items.length;
    const reveal = () => setCount(previous => Math.min(items.length, previous + PAGE_SIZE));
    return <div>
        {children(visible)}
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--text-muted)", fontSize: 12 }} role="status">
            Showing {visible.length} of {items.length}{more ? " · Scroll for more" : " · All loaded"}
        </div>
        {more && <><MoreOnScroll key={count} onReveal={reveal}/><Button size="small" variant="secondary" onClick={reveal}>Load more</Button></>}
    </div>;
}, { noop: false });
