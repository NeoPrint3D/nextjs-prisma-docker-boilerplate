-- CreateTable
CREATE TABLE `Queue` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `error` VARCHAR(191) NULL,
    `data` VARCHAR(191) NULL,
    `done` BOOLEAN NOT NULL DEFAULT false,
    `queue_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Queue_queue_id_key`(`queue_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
