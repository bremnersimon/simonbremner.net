
type LeftRightTextProps = {
    heading: string;
    description: string;
}

const LeftRightText = ({
    heading = "Large Heading Text",
    description = "This is a detailed description that explains the concept on the right side of the layout. The text can wrap to multiple lines and the component will remain responsive.",
}: LeftRightTextProps) => {
    return (
        <section className="w-full py-12 text-left">
            <div className="container mx-auto px-4 md:px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left side - Large text */}
                    <div className="space-y-4">
                        <h2 className="text-5xl  font-bold leading-tight tracking-wider md:text-6xl lg:text-8xl ">
                            {heading}
                        </h2>
                    </div>

                    {/* Right side - Description with shadcn Card */}
                    <div>

                        <p className="text-base md:text-xl max-w-xl">
                            {description}
                        </p>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeftRightText;