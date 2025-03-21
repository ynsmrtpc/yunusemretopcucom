import { MdCode, MdFormatBold, MdFormatItalic, MdFormatStrikethrough, MdRedo, MdUndo, MdOutlineHorizontalSplit } from "react-icons/md";
import { FaHeading, FaListOl, FaListUl, FaParagraph, FaQuoteRight } from "react-icons/fa6";
import { ImPageBreak } from "react-icons/im";
import TooltipComponent from "@/components/Tooltip/Tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CodeXmlIcon } from "lucide-react";

interface EditorMenuProps {
    editor: any;
}

const EditorMenu: React.FC<EditorMenuProps> = ({ editor }) => {
    if (!editor) return null;

    return (
        <ToggleGroup type="multiple" className="border-b justify-start">
            {/* Formatting Buttons */}
            <TooltipComponent tooltip="Bold">
                <ToggleGroupItem value="bold" aria-label="Toggle bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                >
                    <MdFormatBold size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Italic">
                <ToggleGroupItem value="italic" aria-label="Toggle italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                >
                    <MdFormatItalic size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Strike">
                <ToggleGroupItem value="strike" aria-label="Toggle strike"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                >
                    <MdFormatStrikethrough size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Code">
                <ToggleGroupItem
                    value="Code" aria-label="Toggle Code"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editor.can().chain().focus().toggleCode().run()}
                >
                    <MdCode size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            {/* Paragraph */}
            <TooltipComponent tooltip="Paragraph">
                <ToggleGroupItem
                    value="Paragraph" aria-label="Toggle Paragraph"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                >
                    <FaParagraph size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            {/* Headings */}
            {[1, 2, 3, 4, 5, 6].map((level) => (
                <TooltipComponent key={level} tooltip={`Heading ${level}`}>
                    <ToggleGroupItem
                        value={`Heading ${level}`} aria-label={`Toggle Heading ${level}`}
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                        className="flex gap-0"
                    >
                        <FaHeading size={16} /> <strong className="font-bold">{level}</strong>
                    </ToggleGroupItem>
                </TooltipComponent>
            ))}

            {/* Lists */}
            <TooltipComponent tooltip="Bullet List">
                <ToggleGroupItem
                    value="Bullet List" aria-label="Toggle Bullet List"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <FaListUl size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Order List">
                <ToggleGroupItem
                    value="Order List" aria-label="Toggle Order List"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <FaListOl size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            {/* Code Block and Blockquote */}
            <TooltipComponent tooltip="Code Block">
                <ToggleGroupItem
                    value="Code Block" aria-label="Toggle Code Block"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                    <CodeXmlIcon size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Blockquote">
                <ToggleGroupItem
                    value="Blockquote" aria-label="Toggle Blockquote"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <FaQuoteRight size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            {/* Undo/Redo */}
            <TooltipComponent tooltip="Undo">
                <ToggleGroupItem
                    value="Undo" aria-label="Toggle Undo"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="flex items-center gap-2"
                >
                    <MdUndo size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Redo">
                <ToggleGroupItem
                    value="Redo" aria-label="Toggle Redo"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="flex items-center gap-2"
                >
                    <MdRedo size={20} />
                </ToggleGroupItem>
            </TooltipComponent>

            {/* Other Actions */}
            <TooltipComponent tooltip="Horizontal Rule">
                <ToggleGroupItem
                    value="Horizontal Rule" aria-label="Toggle Horizontal Rule"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="flex items-center gap-2"
                >
                    <ImPageBreak />
                </ToggleGroupItem>
            </TooltipComponent>

            <TooltipComponent tooltip="Hard Break">
                <ToggleGroupItem
                    value="Hard Break" aria-label="Toggle Hard Break"
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    className="flex items-center gap-2"
                >
                    <MdOutlineHorizontalSplit />
                </ToggleGroupItem>
            </TooltipComponent>
        </ToggleGroup>
    );
};

export default EditorMenu;