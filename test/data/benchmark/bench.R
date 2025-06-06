library("rjson")
library("ggplot2")
library(extrafont)
font_import()

baseDir <- 'test/data/benchmark'

# List all JSON files in the base directory
files <- list.files(path = baseDir, pattern = "^benchmark_\\d+_\\d+_\\d+\\.json$")
print(files)

# Extract test and run info from filenames
file_info <- do.call(rbind, lapply(files, function(f) {
    m <- regmatches(f, regexec("benchmark_(\\d+)_(\\d+)_\\d+\\.json", f))[[1]]
    data.frame(
        file = file.path(baseDir, f),
        test = as.integer(m[2]),
        run = as.integer(m[3]),
        stringsAsFactors = FALSE
    )
}))

results <- data.frame()

# Sort file_info by test (ascending)
file_info <- file_info[order(file_info$test), ]

# Skip test 15000
file_info <- subset(file_info, test != 15000)

for (test_val in unique(file_info$test)) {
    # Find sequential run (run == 1)
    seq_file <- subset(file_info, test == test_val & run == 1)$file
    if (length(seq_file) == 0) next
    seq_json <- fromJSON(file = seq_file)
    seq_speed <- (1 / seq_json$stats$mean) * 100

    print(paste("Processing test:", test_val, "with sequential speed:", seq_speed))

    # Add sequential run to results
    results <- rbind(results, data.frame(
        Test = test_val,
        Workers = 0,
        FPS = seq_speed,
        Speedup = 1,
        Deviation = seq_json$stats$deviation * 100
    ))

    # Find all parallel runs (run %% 2 == 1, run > 1)
    par_files <- subset(file_info, test == test_val & run > 1 & run %% 2 == 1)
    for (i in seq_len(nrow(par_files))) {
        json <- fromJSON(file = par_files$file[i])
        mean_speed <- (1 / json$stats$mean) * 100
        speedup <- mean_speed / seq_speed
        deviation <- json$stats$deviation
        workers <- (par_files$run[i] - 1) / 2  # 03->1, 05->2, ..., 25->12
        print(paste("  Workers:", workers, "Speedup:", speedup, "Deviation:", deviation))
        results <- rbind(results, data.frame(
            Test = test_val,
            Workers = workers,
            FPS = mean_speed,
            Speedup = speedup,
            Deviation = deviation
        ))
    }
}

# Print results
print(results)
# Plot
if (nrow(results) > 0) {
    # Filter out rows with Workers == 0
    results <- subset(results, Workers > 0)
    
    # SVG output
    svg(file.path(baseDir, "plot.svg"), width = 6, height = 3)
    print(
        ggplot(results, aes(x = Workers, y = Speedup, color = factor(Test), group = Test)) +
            geom_line() +
            geom_point() +
            geom_errorbar(aes(ymin = Speedup - Deviation, ymax = Speedup + Deviation), width = 0.2) +
            scale_x_continuous(
                breaks = sort(unique(results$Workers)),
                minor_breaks = NULL
            ) +
            scale_y_continuous(
                breaks = scales::pretty_breaks(n = 10),
                minor_breaks = NULL
            ) +
            labs(x = "# Workers",
                 y = "Speed-up",
                 color = "Test") +
            theme_minimal()
    )
    dev.off()
    
    # PDF output with embedded Helvetica fonts
    pdf(file.path(baseDir, "plot.pdf"), width = 6, height = 3, family = "ArialMT")
    print(
        ggplot(results, aes(x = Workers, y = Speedup, color = factor(Test), group = Test)) +
            geom_line() +
            geom_point() +
            geom_errorbar(aes(ymin = Speedup - Deviation, ymax = Speedup + Deviation), width = 0.2) +
            scale_x_continuous(
                breaks = sort(unique(results$Workers)),
                minor_breaks = NULL
            ) +
            scale_y_continuous(
                breaks = scales::pretty_breaks(n = 10),
                minor_breaks = NULL
            ) +
            labs(x = "# Workers",
                 y = "Speed-up",
                 color = "Test") +
            theme_minimal()
    )
    dev.off()
    
    # Embed fonts in the PDF
    embedFonts(
        file.path(baseDir, "plot.pdf"),
        options = "-dEmbedAllFonts=true -sFONTPATH=C:/Windows/Fonts"
    )
} else {
    message("No results to plot.")
}