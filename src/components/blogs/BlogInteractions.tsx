// components/blogs/BlogInteractions.tsx
"use client";

import { useState } from "react";
import { Heart, Eye } from "lucide-react";

interface Props {
    blogId: string;
    initialViews: number;
    initialLikes: number;
    apiBase: string;
}

export default function BlogInteractions({
    blogId,
    initialViews,
    initialLikes,
    apiBase,
}: Props) {
    const likedKey = `liked_${blogId}`;
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(
        typeof window !== "undefined" && localStorage.getItem(likedKey) === "true"
    );

    const handleLike = async () => {
        if (isLiked) return;
        try {
            const res = await fetch(`${apiBase}/blogs/${blogId}/like`, {
                method: "POST",
            });
            if (res.ok) {
                localStorage.setItem(likedKey, "true");
                setLikes((l) => l + 1);
                setIsLiked(true);
            }
        } catch { }
    };

    return (
        <div className="mt-10 pt-6 border-t flex items-center justify-between">
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {initialViews} views
                </span>
                <span className="flex items-center gap-1">
                    <Heart
                        className="w-4 h-4"
                        fill={isLiked ? "#f43f5e" : "none"}
                        color={isLiked ? "#f43f5e" : "currentColor"}
                    />
                    {likes} likes
                </span>
            </div>

            <button
                onClick={handleLike}
                disabled={isLiked}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isLiked
                        ? "bg-rose-50 text-rose-500"
                        : "bg-muted hover:bg-rose-50 hover:text-rose-500"
                    }`}
            >
                {isLiked ? "Liked!" : "Like article"}
            </button>
        </div>
    );
}